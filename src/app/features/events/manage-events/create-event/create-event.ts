import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { EventService, EventPayload } from '../../../../core/services/event-service';

export function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('startDateTime')?.value;
  const end = control.get('endDateTime')?.value;

  if (!start || !end) {
    return null;
  }
  if (new Date(start) >= new Date(end)) {
    return { invalidDateRange: true };
  }
  return null;
}

export function whitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }
  return value.trim() === '' ? { isOnlyWhitespace: true } : null;
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

  isSubmitting = false;
  errorMessage = '';
  newEventForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required, whitespaceValidator]),
      description: new FormControl('', [Validators.required, whitespaceValidator]),
      venue: new FormControl('', [Validators.required, whitespaceValidator]),
      address: new FormControl('', [Validators.required, whitespaceValidator]),
      city: new FormControl('', [Validators.required, whitespaceValidator]),
      country: new FormControl('', [Validators.required, whitespaceValidator]),
      startDateTime: new FormControl('', Validators.required),
      endDateTime: new FormControl('', Validators.required),
      capacity: new FormControl('', [Validators.required, Validators.min(1)]),
    },
    {
      validators: dateRangeValidator,
    },
  );

  saveDraft(): void {
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
    const raw = this.newEventForm.value;
    return {
      name: raw.name!,
      description: raw.description!,
      venue: raw.venue!,
      address: raw.address!,
      city: raw.city!,
      country: raw.country!,
      startDateTime: raw.startDateTime!,
      endDateTime: raw.endDateTime!,
      capacity: Number(raw.capacity),
    };
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.newEventForm.get(controlName);
    return !!(control?.errors?.[errorName] && control.touched);
  }
}

