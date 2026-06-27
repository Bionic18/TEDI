import { Component, inject } from '@angular/core';
import {FormArray} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { EventService, EventPayload } from '../../../../core/services/event-service';
import { EventFormService } from '../../../../core/services/event-form-service';


interface TicketTypeFormValue {
  name: string;
  price: number | string;
  quantity: number | string;
}
@Component({
  selector: 'app-create-event',
  standalone: false,
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})

export class CreateEvent {
  private eventService = inject(EventService);
  private router = inject(Router);
  private eventFormService = inject(EventFormService);
  isSubmitting = false;
  errorMessage = '';
  newEventForm = this.eventFormService.createForm();

  saveDraft(): void {
    if (this.newEventForm.errors?.['ticketTypesExceedCapacity']) {
      alert('Total ticket quantity cannot exceed event capacity.');
      this.newEventForm.markAllAsTouched();
      return;
    }

    if (this.newEventForm.invalid) {
      this.newEventForm.markAllAsTouched();
      return;
    }
    const payload = this.buildPayload();

    this.isSubmitting = true;
    this.errorMessage = '';

    this.eventService
      .createEvent(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/manage-events']);
        },
        error: (err) => {
          console.error('Failed to save draft', err);
          this.errorMessage = 'Failed to save draft.';
        },
      });
  }

  publish(): void {
    if (this.newEventForm.errors?.['ticketTypesExceedCapacity']) {
      alert('Total ticket quantity cannot exceed event capacity.');
      this.newEventForm.markAllAsTouched();
      return;
    }

    if (this.newEventForm.invalid) {
      this.newEventForm.markAllAsTouched();
      return;
    }
    const payload = this.buildPayload();

    this.isSubmitting = true;
    this.errorMessage = '';

    this.eventService
      .createEvent(payload)
      .pipe(
        switchMap((createdEvent) =>
          this.eventService.publishEvent(createdEvent.id)
        ),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/manage-events']);
        },
        error: (err) => {
          console.error('Failed to publish event', err);
          this.errorMessage =
            'Draft was created, but publishing failed. The publish endpoint may not be implemented yet.';
        },
      });
  }

  private buildPayload(): EventPayload {
    const raw = this.newEventForm.getRawValue() as {
      name: string;
      description: string;
      venue: string;
      address: string;
      city: string;
      country: string;
      startDateTime: string;
      endDateTime: string;
      capacity: number | string;
      ticketTypes: TicketTypeFormValue[];
    };

    return {
      name: raw.name,
      description: raw.description,
      venue: raw.venue,
      address: raw.address,
      city: raw.city,
      country: raw.country,
      startDateTime: raw.startDateTime,
      endDateTime: raw.endDateTime,
      capacity: Number(raw.capacity),
      ticketTypes: raw.ticketTypes.map((ticketType: TicketTypeFormValue) => ({
        name: ticketType.name.trim(),
        price: Number(ticketType.price),
        quantity: Number(ticketType.quantity),
      })),
    };
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.newEventForm.get(controlName);
    return !!(control?.errors?.[errorName] && control.touched);
  }

  get ticketTypes(): FormArray {
    return this.newEventForm.get('ticketTypes') as FormArray;
  }

  addTicketType(): void {
    this.ticketTypes.push(
      this.eventFormService.createTicketTypeGroup('', 0, 1),
    );

    this.newEventForm.updateValueAndValidity();
  }

  removeTicketType(index: number): void {
    if (this.ticketTypes.length === 1) {
      return;
    }

    this.ticketTypes.removeAt(index);
    this.newEventForm.updateValueAndValidity();
  }

  ticketTypeQuantitySum(): number {
    return this.ticketTypes.controls.reduce((sum, ticketTypeControl) => {
      return sum + Number(ticketTypeControl.get('quantity')?.value || 0);
    }, 0);
  }

  hasTicketTypeError(index: number, controlName: string, errorName: string): boolean {
    const control = this.ticketTypes.at(index).get(controlName);
    return !!(control?.errors?.[errorName] && control.touched);
  }
}

