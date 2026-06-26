import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/services/event-service';
import { Event } from '../../../../core/models/events';
import { AuthService } from '../../../../core/services/auth-service';
import { EventStatus } from '../../../../core/models/eventStatus';
import { BookingService } from '../../../../core/services/booking-service';

@Component({
  selector: 'app-event-details',
  standalone: false,
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);

  authService = inject(AuthService);

  currentEvent = signal<Event | null>(null);

  ticketQuantity = signal(1);
  reservationMessage = signal('');
  reservationError = signal('');

  selectedTicketTypeId = signal<number | null>(null);
  isSubmittingReservation = signal(false);

  canReserve = computed(() => {
    const event = this.currentEvent();

    return !!(
      event &&
      event.status === EventStatus.Published &&
      this.authService.hasRole('user')
    );
  });

  ngOnInit() {
    this.loadEvent();
  }

  updateTicketQuantity(value: string): void {
    const quantity = Number(value);

    this.ticketQuantity.set(quantity);
    this.reservationMessage.set('');
    this.reservationError.set('');
  }

  submitReservation(): void { //small skeleton for when actual reservations happen xoxo
      const event = this.currentEvent();
      const ticketTypeId = this.selectedTicketTypeId();

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

    if (!ticketTypeId) {
      this.reservationError.set('Please select a ticket type.');
      return;
    }

    if (this.ticketQuantity() < 1) {
      this.reservationError.set('Please select at least one ticket.');
      return;
    }

    const selectedTicketType = event.ticketTypes?.find(
      ticketType => ticketType.id === ticketTypeId
    );

    if (!selectedTicketType) { //never happens with the drop down, used to suppress warning in the if below
      this.reservationError.set('Selected ticket type is not available.');
      return;
    }

    if (this.ticketQuantity() > selectedTicketType.available) {
      this.reservationError.set('Not enough tickets available for this ticket type.');
      return;
    }

    const confirmed = confirm(
      `Confirm reservation of ${this.ticketQuantity()} ticket(s) for "${event.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.isSubmittingReservation.set(true);

    this.bookingService.createBooking(event.id, {
      ticketTypeId,
      numberOfTickets: this.ticketQuantity(),
    }).subscribe({
      next: () => {
        this.reservationMessage.set('Reservation completed successfully.');
        this.reservationError.set('');
        this.isSubmittingReservation.set(false);
        this.loadEvent();
      },
      error: (err) => {
        console.error('Failed to create reservation', err);
        this.reservationError.set(
          err.error?.message ?? 'Failed to complete reservation.'
        );
        this.reservationMessage.set('');
        this.isSubmittingReservation.set(false);
      },
    });
  }

  private trackViewedEvent(eventID: number): void { //creates viewed events in local storage for current user
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return;
    }

    const storageKey = `viewedEvents-${currentUser.id}`;

    const storedValue = localStorage.getItem(storageKey);
    const viewedEventIDs: number[] = storedValue
      ? JSON.parse(storedValue)
      : [];

    const updatedViewedEventIDs = [
      eventID,
      ...viewedEventIDs.filter(id => id !== eventID),
    ].slice(0, 20); //keep 20 viewed events

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedViewedEventIDs)
    );
  }
  private loadEvent(): void { //made as a helper function for ngInit and updating the event when reservations change
    const eventID = Number(this.route.snapshot.paramMap.get('id'));

    this.eventService.getEventByID(eventID).subscribe({
      next: (event) => {
        this.currentEvent.set(event);
        this.trackViewedEvent(event.id);

        const firstAvailableTicketType = event.ticketTypes?.find(
          ticketType => ticketType.available > 0
        );

        this.selectedTicketTypeId.set(firstAvailableTicketType?.id ?? null);
      },
      error: (err) => {
        console.error('Failed to load event details', err);
      },
    });
  }
  updateSelectedTicketType(value: string): void {
    this.selectedTicketTypeId.set(Number(value));
    this.reservationMessage.set('');
    this.reservationError.set('');
  }
}
