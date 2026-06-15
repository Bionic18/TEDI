import { Component, inject, OnInit } from '@angular/core';
import { EventService } from '../../../core/services/event-service';
import { Event } from '../../../core/models/events';

@Component({
  selector: 'app-browse-events',
  standalone: false,
  templateUrl: './browse-events.html',
  styleUrl: './browse-events.css',
})
export class BrowseEvents implements OnInit {
  private eventService = inject(EventService);
  events: Event[] = [];

  ngOnInit() {
    // Public browse view: only published events are shown.
    this.eventService
      .getAllEvents({ status: 'PUBLISHED' })
      .subscribe((events) => (this.events = events));
  }
}
