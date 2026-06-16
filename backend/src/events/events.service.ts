import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, EventStatus } from '../generated/prisma/client.mjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

// Optional filters for the listing endpoint. organizerId lets the
// "manage events" page fetch only the current user's events (including drafts),
// while the public browse page can ask for status=PUBLISHED only.
export interface FindAllFilter {
  status?: EventStatus;
  organizerId?: number;
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FindAllFilter = {}) {
    return this.prisma.event.findMany({
      where: {
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.organizerId ? { organizerId: filter.organizerId } : {}),
      },
      orderBy: { startDateTime: 'asc' },
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(createEventDto: CreateEventDto, organizerId: number) {
    this.assertDateRange(
      createEventDto.startDateTime,
      createEventDto.endDateTime,
    );

    return this.prisma.event.create({
      data: {
        name: createEventDto.name,
        description: createEventDto.description,
        venue: createEventDto.venue,
        address: createEventDto.address,
        city: createEventDto.city,
        country: createEventDto.country,
        startDateTime: new Date(createEventDto.startDateTime),
        endDateTime: new Date(createEventDto.endDateTime),
        capacity: createEventDto.capacity,
        status: EventStatus.DRAFT,
        organizerId,
      },
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto, userId: number) {
    const event = await this.findOne(id);
    this.assertOwnership(event.organizerId, userId);

    // Validate the date range against the merged (current + incoming) values.
    const start = updateEventDto.startDateTime ?? event.startDateTime;
    const end = updateEventDto.endDateTime ?? event.endDateTime;
    this.assertDateRange(start, end);

    try {
      return await this.prisma.event.update({
        where: { id },
        data: {
          ...updateEventDto,
          ...(updateEventDto.startDateTime
            ? { startDateTime: new Date(updateEventDto.startDateTime) }
            : {}),
          ...(updateEventDto.endDateTime
            ? { endDateTime: new Date(updateEventDto.endDateTime) }
            : {}),
          ...(updateEventDto.status
            ? { status: updateEventDto.status as EventStatus }
            : {}),
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number, userId: number) {
    const event = await this.findOne(id);
    this.assertOwnership(event.organizerId, userId);

    // Assignment rule: deletion is only allowed before the event is published
    // (and, once bookings exist, before the first booking). A published event
    // must be cancelled instead (PUT status=CANCELLED), which keeps its data
    // for historical / traceability reasons.
    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException(
        'Only unpublished (DRAFT) events can be deleted. Cancel the event instead.',
      );
    }

    return this.prisma.event.delete({ where: { id } });
  }

  private assertOwnership(organizerId: number, userId: number) {
    if (organizerId !== userId) {
      throw new ForbiddenException('You are not the organizer of this event');
    }
  }

  private assertDateRange(start: string | Date, end: string | Date) {
    if (new Date(start) >= new Date(end)) {
      throw new BadRequestException(
        'startDateTime must be earlier than endDateTime',
      );
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Event not found');
    }
    throw error;
  }
}
