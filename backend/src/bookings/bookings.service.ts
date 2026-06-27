import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, EventStatus } from '../generated/prisma/client.mjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(eventId: number, attendeeId: number, dto: CreateBookingDto) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new NotFoundException('Event not found.');
      }

      if (event.organizerId === attendeeId) {
        throw new ForbiddenException(
          'Organizers cannot reserve tickets for their own events.',
        );
      }
      if (event.status !== EventStatus.PUBLISHED) {
        throw new BadRequestException(
          'Reservations are only allowed for published events.',
        );
      }

      const ticketType = await tx.ticketType.findFirst({
        where: {
          id: dto.ticketTypeId,
          eventId,
        },
      });

      if (!ticketType) {
        throw new NotFoundException(
          'Ticket type not found for this event.',
        );
      }

      if (ticketType.available < dto.numberOfTickets) {
        throw new BadRequestException(
          'Not enough tickets available for this ticket type.',
        );
      }

      const updateResult = await tx.ticketType.updateMany({
        where: {
          id: dto.ticketTypeId,
          eventId,
          available: {
            gte: dto.numberOfTickets,
          },
        },
        data: {
          available: {
            decrement: dto.numberOfTickets,
          },
        },
      });

      if (updateResult.count !== 1) {
        throw new BadRequestException(
          'Not enough tickets available for this ticket type.',
        );
      }

      const totalCost = ticketType.price * dto.numberOfTickets;

      return tx.booking.create({
        data: {
          eventId,
          ticketTypeId: dto.ticketTypeId,
          attendeeId,
          numberOfTickets: dto.numberOfTickets,
          totalCost,
          status: BookingStatus.CONFIRMED,
        },
        include: {
          event: true,
          ticketType: true,
        },
      });
    });
  }

  async findMyBookings(attendeeId: number) {
    return this.prisma.booking.findMany({
      where: { attendeeId },
      include: {
        event: true,
        ticketType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findEventBookings(eventId: number, organizerId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'Only the organizer can view bookings for this event.',
      );
    }

    return this.prisma.booking.findMany({
      where: { eventId },
      include: {
        ticketType: true,
        attendee: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
