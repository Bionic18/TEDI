export interface Event {
  id: number;
  name: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  status: string;
  organizerId: number;
  ticketTypes?: TicketType[];

  _count?: {
    bookings: number;
  };
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
