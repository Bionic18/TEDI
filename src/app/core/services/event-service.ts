import { Injectable } from '@angular/core';
import { Event} from '../models/events';

@Injectable({
  providedIn: 'root',
})
export class EventService {
 private events : Event[] = [ //THIS IS TEMPORARY MOCK DATA
    {
      id: 1,
      name: "Jaul",
      description: "Jaul Concert in Athens!",
      venue: "Technopolis",
      address: "Pireos 100",
      city: "Athens",
      country: "Greece",
      startDateTime: new Date("2026-06-19T20:00:00"),
      endDateTime: new Date("2026-06-20T00:00:00"),
      capacity:5000
    },
    {
      id: 2,
      name: "Sponty",
      description: "Sponty Concert in Athens!",
      venue: "Plato Academy Park",
      address: "Monastiriou & Tilefanous",
      city: "Athens",
      country: "Greece",
      startDateTime: new Date("2026-06-13T22:00:00"),
      endDateTime: new Date("2026-06-13T23:00:00"),
      capacity: 10000
    },
    {
      id: 3,
      name: "Pepsi MAX presents Parklife 2026 - Saturday",
      description: "Skepta Concert in Manchester!",
      venue:"Heaton Park",
      address: "Middleton Road",
      city: "Manchester",
      country: "United Kingdom",
      startDateTime: new Date("2026-06-20T20:00:00"),
      endDateTime: new Date("2026-06-20T23:30:00"),
      capacity: 30000
    }
  ];
 getAllEvents(): Event[]{
   return this.events;
 }
  getEventByID(temp_id :number) :Event | undefined {
    return this.events.find(temp_event => temp_event.id === temp_id);
  }
}
