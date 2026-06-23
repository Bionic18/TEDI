import { Component, inject, signal } from '@angular/core';
import { EventService } from '../../../core/services/event-service';
import { Event } from '../../../core/models/events';
import { EventStatus } from '../../../core/models/eventStatus';

@Component({
  selector: 'app-browse-events',
  standalone: false,
  templateUrl: './browse-events.html',
  styleUrl: './browse-events.css',
})
export class BrowseEvents {
  eventService = inject(EventService);

  events = signal<Event[]>([]);

  ngOnInit() {
    this.eventService
      .getAllEvents({ status: EventStatus.Published || EventStatus.Cancelled })
      .subscribe({
        next: (events) => {
          this.events.set(events);
        },
        error: (err) => {
          console.error('Failed to load events', err);
        },
      });
  }
}
