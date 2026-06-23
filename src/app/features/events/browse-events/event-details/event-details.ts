import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/services/event-service';
import { Event } from '../../../../core/models/events';

@Component({
  selector: 'app-event-details',
  standalone: false,
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  currentEvent = signal<Event | null>(null);

  ngOnInit() {
    const eventID = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getEventByID(eventID).subscribe({
      next: (event) => {
        this.currentEvent.set(event);
      },
      error: (err) => {
        console.error('Failed to load event details', err);
      },
    });
  }
}
