import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/events';

export interface CreateBookingPayload {
  ticketTypeId: number;
  numberOfTickets: number;
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
}
