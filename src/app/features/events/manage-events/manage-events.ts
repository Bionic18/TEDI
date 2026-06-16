import { Component, inject } from '@angular/core';
import { Event } from '../../../core/models/events';
import { EventService } from '../../../core/services/event-service';
import { AuthService } from '../../../core/services/auth-service';
import {EventStatus} from '../../../core/models/eventStatus';

@Component({
  selector: 'app-manage-events',
  standalone: false,
  templateUrl: './manage-events.html',
  styleUrl: './manage-events.css',
})
export class ManageEvents {
  eventService = inject(EventService);
  authService = inject(AuthService);

  events: Event[] = [];
  drafts: Event[] = [];
  nonDrafts: Event[] = [];

  ngOnInit() {
    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      return;
    }

    this.loadEvents();
  }

  loadEvents(): void {
    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      return;
    }

    /*
      TODO:
      Ideally this should become:
      this.eventService.getAllEvents({ organizerId: currentUser.id })

      But your current mock AuthService probably has username/role,
      not backend id yet.
    */

    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;

        this.nonDrafts = this.events.filter(
          event => event.status !== EventStatus.Draft
        );

        this.drafts = this.events.filter(
          event => event.status === EventStatus.Draft
        );
      },
      error: (err) => {
        console.error('Failed to load managed events', err);
      },
    });
  }

  deleteDraft(eventID: number): void {
    const confirmed = confirm(
      'Are you sure you want to permanently delete this draft?'
    );

    if (!confirmed) {
      return;
    }

    this.eventService.deleteEvent(eventID).subscribe({
      next: () => {
        this.loadEvents();
      },
      error: (err) => {
        console.error('Failed to delete draft', err);
      },
    });
  }

  publishEvent(eventID: number): void {
    // TODO:
    // Needs backend endpoint, e.g. PATCH /events/:id/publish
    console.warn('Publish endpoint not implemented yet', eventID);
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
      new Date(event.startDateTime) < new Date(event.endDateTime)
    );
  }
}
