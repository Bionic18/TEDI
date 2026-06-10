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
      date: new Date()
    },
    {
      id: 2,
      name: "Sponty",
      description: "Sponty Concert in Athens!",
      date: new Date()
    },
    {
      id: 3,
      name: "Skepta",
      description: "Skepta Concert in Thessaloniki!",
      date: new Date()
    }
  ];
 getAllEvents(): Event[]{
   return this.events;
 }
  getEventByID(temp_id :number) :Event | undefined {
    return this.events.find(temp_event => temp_event.id === temp_id);
  }
}
