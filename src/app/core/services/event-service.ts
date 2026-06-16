import { Injectable } from '@angular/core';
import {Event, EventStatus} from '../models/events';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private events: Event[] = [ //THIS IS TEMPORARY MOCK DATA
    {
      id: 1,
      name: "Jaul",
      description: "Jaul Concert in Athens!",
      organizerUsername: "Test Doe",
      venue: "Technopolis",
      address: "Pireos 100",
      city: "Athens",
      country: "Greece",
      startDateTime: new Date("2026-06-19T20:00:00"),
      endDateTime: new Date("2026-06-20T00:00:00"),
      capacity: 5000,
      status: EventStatus.Published
    },
    {
      id: 2,
      name: "Sponty",
      description: "Sponty Concert in Athens!",
      organizerUsername: "Test Doe",
      venue: "Plato Academy Park",
      address: "Monastiriou & Tilefanous",
      city: "Athens",
      country: "Greece",
      startDateTime: new Date("2026-06-13T22:00:00"),
      endDateTime: new Date("2026-06-13T23:00:00"),
      capacity: 10000,
      status: EventStatus.Published
    },
    {
      id: 3,
      name: "Pepsi MAX presents Parklife 2026 - Saturday",
      description: "Skepta Concert in Manchester!",
      organizerUsername: "Skepta Manager",
      venue: "Heaton Park",
      address: "Middleton Road",
      city: "Manchester",
      country: "United Kingdom",
      startDateTime: new Date("2026-06-20T20:00:00"),
      endDateTime: new Date("2026-06-20T23:30:00"),
      capacity: 30000,
      status: EventStatus.Cancelled
    }
  ];

  getAllEvents(
    status?: EventStatus
  ): Event[] {

    if (status === undefined) {
      return this.events;
    }

    return this.events.filter(
      event => event.status === status
    );
  }

  getEventByID(temp_id: number): Event | undefined {
    return this.events.find(temp_event => temp_event.id === temp_id);
  }

  addEvent(newEvent: Event): void { //temporary solutions
    this.events.push(newEvent);
  }

  getNextID(): number { //temporary solution #2
    if (this.events.length === 0) {
      return 1;
    }
    return Math.max(
      ...this.events.map(event => event.id)
    ) + 1;
  }

  getEventsByOrganizer( //use this for the manage events page
    organizerUsername: string,
  ): Event[] {

    return this.events.filter(
      event =>
        event.organizerUsername === organizerUsername
    );
  }

  updateEvent(updatedEvent: Event) {
    const index = this.events.findIndex(event => event.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = updatedEvent;
    }
  }

  cancelEvent(eventID: number): void {

    const event = this.getEventByID(eventID);

    if (event) {
      event.status = EventStatus.Cancelled;
    }

  }

  publishEvent(eventID: number): boolean {

    const event = this.getEventByID(eventID);

    if (!event) {
      return false;
    }

    if (!this.canPublish(event)) {
      return false;
    }

    event.status = EventStatus.Published;

    return true;
  }

  canPublish(event: Event): boolean {

    return !!(
      event.name &&
      event.description &&
      event.venue &&
      event.address &&
      event.city &&
      event.country &&
      event.capacity > 0 &&
      event.startDateTime &&
      event.endDateTime &&
      event.startDateTime < event.endDateTime
    );

  }

  deleteEvent(eventID: number): void {

    this.events = this.events.filter(
      event => event.id !== eventID
    );

  }


}
