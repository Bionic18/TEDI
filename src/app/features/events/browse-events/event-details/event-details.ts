import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/services/event-service';
import { Event } from '../../../../core/models/events';
import { AuthService } from '../../../../core/services/auth-service';
import { EventStatus } from '../../../../core/models/eventStatus';

@Component({
  selector: 'app-event-details',
  standalone: false,
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  authService = inject(AuthService);

  currentEvent = signal<Event | null>(null);

  ticketQuantity = signal(1);
  reservationMessage = signal('');
  reservationError = signal('');

  canReserve = computed(() => {
    const event = this.currentEvent();

    return !!(
      event &&
      event.status === EventStatus.Published &&
      this.authService.hasRole('user')
    );
  });

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

  updateTicketQuantity(value: string): void {
    const quantity = Number(value);

    this.ticketQuantity.set(quantity);
    this.reservationMessage.set('');
    this.reservationError.set('');
  }

  submitReservation(): void { //small skeleton for when actual reservations happen xoxo
    const event = this.currentEvent();

    this.reservationMessage.set('');
    this.reservationError.set('');

    if (!event) {
      this.reservationError.set('Event details are not available.');
      return;
    }

    if (!this.authService.currentUser()) {
      this.reservationError.set('You must be logged in to reserve tickets.');
      return;
    }

    if (event.status !== EventStatus.Published) {
      this.reservationError.set('Reservations are only available for published events.');
      return;
    }

    if (this.ticketQuantity() < 1) {
      this.reservationError.set('Please select at least one ticket.');
      return;
    }

    if (this.ticketQuantity() > event.capacity) {
      this.reservationError.set('The requested number of tickets exceeds the event capacity.');
      return;
    }

    const confirmed = confirm(
      `Confirm reservation of ${this.ticketQuantity()} ticket(s) for "${event.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.reservationMessage.set(
      'Reservation form is ready. The reservation endpoint has not been implemented yet.'
    );
  }
}
