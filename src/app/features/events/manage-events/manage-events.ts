import { Component, computed, inject, signal } from '@angular/core';
import { Event } from '../../../core/models/events';
import { EventService } from '../../../core/services/event-service';
import { AuthService } from '../../../core/services/auth-service';
import { EventStatus } from '../../../core/models/eventStatus';
import { BookingService, EventBooking } from '../../../core/services/booking-service';

@Component({
  selector: 'app-manage-events',
  standalone: false,
  templateUrl: './manage-events.html',
  styleUrl: './manage-events.css',
})
export class ManageEvents {
  private eventService = inject(EventService);
  authService = inject(AuthService);
  private bookingService = inject(BookingService);

  selectedBookingsEventId = signal<number | null>(null);
  selectedEventBookings = signal<EventBooking[]>([]);
  bookingsErrorMessage = signal('');
  isLoadingBookings = signal(false);

  events = signal<Event[]>([]);


  drafts = computed(() =>
    this.events().filter(event => event.status === EventStatus.Draft)
  );

  nonDrafts = computed(() =>
    this.events().filter(event => event.status !== EventStatus.Draft)
  );

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents(): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.events.set([]);
      return;
    }

    this.eventService.getAllEvents({ organizerId: currentUser.id }).subscribe({
      next: (events) => {
        this.events.set(events);
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
    this.eventService.publishEvent(eventID).subscribe({
      next: () => {
        this.loadEvents();
      },
      error: (err) => {
        console.error('Failed to publish event', err);
      },
    });
  }

  cancelEvent(eventID: number): void {
    const confirmed = confirm('Are you sure you want to cancel this event?');

    if (!confirmed) {
      return;
    }

    this.eventService.cancelEvent(eventID).subscribe({
      next: () => {
        this.loadEvents();
      },
      error: (err) => {
        console.error('Failed to cancel event', err);
      },
    });
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
  viewBookings(eventId: number): void {
    if (this.selectedBookingsEventId() === eventId) {
      this.selectedBookingsEventId.set(null);
      this.selectedEventBookings.set([]);
      this.bookingsErrorMessage.set('');
      return;
    }

    this.selectedBookingsEventId.set(eventId);
    this.selectedEventBookings.set([]);
    this.bookingsErrorMessage.set('');
    this.isLoadingBookings.set(true);

    this.bookingService.getEventBookings(eventId).subscribe({
      next: (bookings) => {
        this.selectedEventBookings.set(bookings);
        this.isLoadingBookings.set(false);
      },
      error: (err) => {
        console.error('Failed to load event bookings', err);
        this.bookingsErrorMessage.set('Failed to load bookings for this event.');
        this.isLoadingBookings.set(false);
      },
    });
  }
}

