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
      include: {
        ticketTypes: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { startDateTime: 'asc' },
    });
  }
  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: true,
        bookings: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

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

    const ticketTypes = this.prepareTicketTypes(
      createEventDto.ticketTypes,
      createEventDto.capacity,
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
        ticketTypes: {
          create: ticketTypes,
        },
      },
      include: {
        ticketTypes: true,
      },
    });
  }

  private prepareTicketTypes(
    ticketTypes: CreateEventDto['ticketTypes'],
    capacity: number,
  ) {
    const normalizedTicketTypes =
      ticketTypes && ticketTypes.length > 0
        ? ticketTypes
        : [
          {
            name: 'General Admission',
            price: 0,
            quantity: capacity,
          },
        ];

    const totalTicketQuantity = normalizedTicketTypes.reduce(
      (sum, ticketType) => sum + ticketType.quantity,
      0,
    );

    if (totalTicketQuantity > capacity) {
      throw new BadRequestException(
        'The total quantity of ticket types cannot exceed the event capacity.',
      );
    }

    return normalizedTicketTypes.map((ticketType) => ({
      name: ticketType.name,
      price: ticketType.price,
      quantity: ticketType.quantity,
      available: ticketType.quantity,
    }));
  }

  async update(id: number, updateEventDto: UpdateEventDto, userId: number) {
    const event = await this.findOne(id);
    this.assertOwnership(event.organizerId, userId);

    const start = updateEventDto.startDateTime ?? event.startDateTime;
    const end = updateEventDto.endDateTime ?? event.endDateTime;
    this.assertDateRange(start, end);

    const { ticketTypes, ...eventFields } = updateEventDto;

    try {
      return await this.prisma.event.update({
        where: { id },
        data: {
          ...eventFields,
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
        include: {
          ticketTypes: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
  async publish(id: number, userId: number) {
    const event = await this.findOne(id);
    this.assertOwnership(event.organizerId, userId);

    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT events can be published.');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.PUBLISHED,
      },
    });
  }

  async cancel(id: number, userId: number) {
    const event = await this.findOne(id);
    this.assertOwnership(event.organizerId, userId);

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Only PUBLISHED events can be cancelled.');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.CANCELLED,
      },
    });
  }
  async remove(id: number, userId: number) {
    const event = await this.findOne(id);
    this.assertOwnership(event.organizerId, userId);

    const hasBookings = event.bookings.length > 0;

    const canDelete =
      event.status === EventStatus.DRAFT ||
      (event.status === EventStatus.PUBLISHED && !hasBookings);

    if (!canDelete) {
      throw new BadRequestException(
        'Events can only be deleted before publication or before the first booking. Cancel the event instead.',
      );
    }

    return this.prisma.event.delete({
      where: { id },
    });
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
