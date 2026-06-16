import { Component, inject } from '@angular/core';
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

  events: Event[] = [];

  ngOnInit() {
    this.eventService
      .getAllEvents({ status: EventStatus.Published })
      .subscribe({
        next: (events) => {
          this.events = events;
        },
        error: (err) => {
          console.error('Failed to load events', err);
        },
      });
  }
}
