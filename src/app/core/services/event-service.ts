import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/events';

// Payload sent when creating/updating an event. The backend fills in id,
// status and organizerId (the latter from the JWT), so they are not sent here.
export interface EventPayload {
  name: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/events';

  // GET /events  (public). Optional filters map to query params, e.g.
  // { status: 'PUBLISHED' } or { organizerId: 3 } for the manage page.
  getAllEvents(filter?: {
    status?: string;
    organizerId?: number;
  }): Observable<Event[]> {
    let params: Record<string, string> = {};
    if (filter?.status) {
      params['status'] = filter.status;
    }
    if (filter?.organizerId != null) {
      params['organizerId'] = String(filter.organizerId);
    }
    return this.http.get<Event[]>(this.baseUrl, { params });
  }

  // GET /events/{id}  (public)
  getEventByID(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.baseUrl}/${id}`);
  }

  // POST /events  (requires a logged-in user; the JWT identifies the organizer)
  createEvent(payload: EventPayload): Observable<Event> {
    return this.http.post<Event>(this.baseUrl, payload);
  }

  // PUT /events/{id}  (organizer only)
  updateEvent(id: number, payload: Partial<EventPayload>): Observable<Event> {
    return this.http.put<Event>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE /events/{id}  (organizer only, DRAFT events only)
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  publishEvent(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.baseUrl}/${id}/publish`, {});
  }

  cancelEvent(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.baseUrl}/${id}/cancel`, {});
  }
}

// TODO:
// Replace with backend endpoints once available:
// cancelEvent

// cancelEvent(eventID: number): void {
//
//   const event = this.getEventByID(eventID);
//
//   if (event) {
//     event.status = EventStatus.Cancelled;
//   }
//
// }
//
