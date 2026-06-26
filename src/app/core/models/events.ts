import {EventStatus} from './eventStatus';

export interface Event {
  id: number;

  name: string;
  description: string;

  venue: string;
  address: string;
  city: string;
  country: string;

  startDateTime: Date | string;
  endDateTime: Date | string;

  capacity: number;

  status: EventStatus;

  organizerId: number;
  ticketTypes?: TicketType[];
  bookings?: Booking[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
export interface TicketType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  available: number;
  eventId: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Booking {
  id: number;
  numberOfTickets: number;
  totalCost: number;
  status: BookingStatus;
  eventId: number;
  ticketTypeId: number;
  attendeeId: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  ticketType?: TicketType;
}

export enum BookingStatus {
  Pending = 'PENDING',
  Confirmed = 'CONFIRMED',
  Cancelled = 'CANCELLED',
}
