import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/events';

export interface CreateBookingPayload {
  ticketTypeId: number;
  numberOfTickets: number;
}

export interface EventBooking {
  id: number;
  numberOfTickets: number;
  totalCost: number;
  status: string;
  eventId: number;
  ticketTypeId: number;
  attendeeId: number;
  createdAt: string;
  updatedAt: string;
  ticketType?: {
    id: number;
    name: string;
    price: number;
  };
  attendee?: {
    id: number;
    username: string;
    email: string;
  };
}
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';

  createBooking(
    eventId: number,
    payload: CreateBookingPayload
  ): Observable<Booking> {
    return this.http.post<Booking>(
      `${this.baseUrl}/events/${eventId}/bookings`,
      payload
    );
  }
  getEventBookings(eventId: number): Observable<EventBooking[]> {
    return this.http.get<EventBooking[]>(
      `${this.baseUrl}/events/${eventId}/bookings`
    );
  }
}
