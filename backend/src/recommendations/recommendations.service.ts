import { Injectable } from '@nestjs/common';
import { BookingStatus, EventStatus } from '../generated/prisma/client.mjs';
import { PrismaService } from '../prisma/prisma.service.js';

interface Interaction {
  userId: number;
  eventId: number;
  rating: number;
}

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async recommendForUser(userId: number, viewedEventIds: number[] = []) {
    const publishedEvents = await this.prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
      },
      include: {
        ticketTypes: true,
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    if (publishedEvents.length === 0) {
      return [];
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
      },
    });

    const interactions = this.buildInteractions(
      bookings.map((booking) => ({
        userId: booking.attendeeId,
        eventId: booking.eventId,
        rating: 5, //Booked events have higher recommendation than viewed
      })),
      userId,
      viewedEventIds,
    );

    const knownEventIds = new Set<number>(); //exclude viewed or booked events

    for (const interaction of interactions) {
      if (interaction.userId === userId) {
        knownEventIds.add(interaction.eventId);
      }
    }

    const candidateEvents = publishedEvents.filter(
      (event) => !knownEventIds.has(event.id),
    );

    if (candidateEvents.length === 0) {
      return [];
    }

    if (interactions.length < 2) { //if data is way too little, we use a fallback
      return this.fallbackRecommendations(candidateEvents, bookings);
    }

    const model = this.trainBiasedMatrixFactorization(
      interactions,
      publishedEvents.map((event) => event.id),
      userId,
    );

    const scoredEvents = candidateEvents.map((event) => {
      const score = this.predictScore(model, userId, event.id);
      const popularityBonus = bookings.filter(
        (booking) => booking.eventId === event.id,
      ).length * 0.01;

      return {
        event,
        score: score + popularityBonus,
      };
    });

    return scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ event, score }) => ({
        ...event,
        recommendationScore: Number(score.toFixed(4)),
      }));
  }

  private buildInteractions(
    bookingInteractions: Interaction[],
    currentUserId: number,
    viewedEventIds: number[],
  ): Interaction[] {
    const interactionMap = new Map<string, Interaction>(); //Use a map to avoid duplicates. Bookings are kept over views

    for (const interaction of bookingInteractions) {
      const key = `${interaction.userId}-${interaction.eventId}`;
      interactionMap.set(key, interaction);
    }

    for (const eventId of viewedEventIds) {
      const key = `${currentUserId}-${eventId}`;

      if (!interactionMap.has(key)) {
        interactionMap.set(key, {
          userId: currentUserId,
          eventId,
          rating: 3, //every event that's interacted with has a score of 3
        });
      }
    }

    return Array.from(interactionMap.values());
  }
//Trains a BMF model using a global mean, user biases, event biases and latent user and event factors(arrays) using SGD
  private trainBiasedMatrixFactorization(
    interactions: Interaction[],
    allPublishedEventIds: number[],
    currentUserId: number,
  ) {
    const userIds = Array.from(
      new Set([
        ...interactions.map((interaction) => interaction.userId),
        currentUserId,
      ]),
    );

    const eventIds = Array.from(
      new Set([
        ...allPublishedEventIds,
        ...interactions.map((interaction) => interaction.eventId),
      ]),
    );

    const userIndex = new Map<number, number>();
    const eventIndex = new Map<number, number>();

    userIds.forEach((id, index) => userIndex.set(id, index));
    eventIds.forEach((id, index) => eventIndex.set(id, index));

    const userCount = userIds.length;
    const eventCount = eventIds.length;
    //small values because of small dataset
    const latentFeatures = 4;
    const epochs = 80;
    const learningRate = 0.01;
    const regularization = 0.05;

    const globalMean =
      interactions.reduce((sum, interaction) => sum + interaction.rating, 0) /
      interactions.length;

    const userBiases = Array(userCount).fill(0);
    const eventBiases = Array(eventCount).fill(0);

    const userFactors = Array.from({ length: userCount }, (_, userPosition) =>
      Array.from({ length: latentFeatures }, (_, featurePosition) =>
        this.initialSmallValue(userPosition, featurePosition),
      ),
    );

    const eventFactors = Array.from({ length: eventCount }, (_, eventPosition) =>
      Array.from({ length: latentFeatures }, (_, featurePosition) =>
        this.initialSmallValue(eventPosition + 11, featurePosition + 7),
      ),
    );

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (const interaction of interactions) {
        const userPosition = userIndex.get(interaction.userId)!;
        const eventPosition = eventIndex.get(interaction.eventId)!;

        const prediction = this.predictFromPositions(
          globalMean,
          userBiases,
          eventBiases,
          userFactors,
          eventFactors,
          userPosition,
          eventPosition,
        );

        const error = interaction.rating - prediction;

        userBiases[userPosition] +=
          learningRate *
          (error - regularization * userBiases[userPosition]);

        eventBiases[eventPosition] +=
          learningRate *
          (error - regularization * eventBiases[eventPosition]);

        for (let feature = 0; feature < latentFeatures; feature++) {
          const oldUserFactor = userFactors[userPosition][feature];
          const oldEventFactor = eventFactors[eventPosition][feature];

          userFactors[userPosition][feature] +=
            learningRate *
            (error * oldEventFactor -
              regularization * oldUserFactor);

          eventFactors[eventPosition][feature] +=
            learningRate *
            (error * oldUserFactor -
              regularization * oldEventFactor);
        }
      }
    }

    return {
      globalMean,
      userBiases,
      eventBiases,
      userFactors,
      eventFactors,
      userIndex,
      eventIndex,
    };
  }

  private predictScore(
    model: ReturnType<typeof this.trainBiasedMatrixFactorization>,
    userId: number,
    eventId: number,
  ): number {
    const userPosition = model.userIndex.get(userId);
    const eventPosition = model.eventIndex.get(eventId);

    if (userPosition == null || eventPosition == null) {
      return model.globalMean;
    }

    return this.predictFromPositions(
      model.globalMean,
      model.userBiases,
      model.eventBiases,
      model.userFactors,
      model.eventFactors,
      userPosition,
      eventPosition,
    );
  }

  private predictFromPositions(
    globalMean: number,
    userBiases: number[],
    eventBiases: number[],
    userFactors: number[][],
    eventFactors: number[][],
    userPosition: number,
    eventPosition: number,
  ): number {
    let dotProduct = 0;

    for (let feature = 0; feature < userFactors[userPosition].length; feature++) {
      dotProduct +=
        userFactors[userPosition][feature] *
        eventFactors[eventPosition][feature];
    }

    return (
      globalMean +
      userBiases[userPosition] +
      eventBiases[eventPosition] +
      dotProduct
    );
  }

  private initialSmallValue(row: number, column: number): number {
    return (((row + 1) * (column + 3)) % 10) / 100;
  }

  private fallbackRecommendations(candidateEvents: any[], bookings: any[]) {
    return candidateEvents
      .map((event) => ({
        event,
        score: bookings.filter((booking) => booking.eventId === event.id).length,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return (
          new Date(a.event.startDateTime).getTime() -
          new Date(b.event.startDateTime).getTime()
        );
      })
      .slice(0, 5)
      .map(({ event, score }) => ({
        ...event,
        recommendationScore: score,
      }));
  }
}
