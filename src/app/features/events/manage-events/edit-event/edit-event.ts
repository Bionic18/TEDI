import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, EventPayload } from '../../../../core/services/event-service';
import { Event } from '../../../../core/models/events';
import { EventFormService } from '../../../../core/services/event-form-service';

@Component({
  selector: 'app-edit-event',
  standalone: false,
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.css',
})
export class EditEvent {
  eventID: number | null = null;
  currentEvent: Event | undefined = undefined;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  eventService = inject(EventService);
  eventFormService = inject(EventFormService);

  editEventForm = this.eventFormService.createForm();

  ngOnInit() {
    this.eventID = Number(this.route.snapshot.paramMap.get('id'));

    this.eventService.getEventByID(this.eventID).subscribe({
      next: (event) => {
        this.currentEvent = event;

        this.editEventForm.patchValue({
          name: event.name,
          description: event.description,

          venue: event.venue,
          address: event.address,
          city: event.city,
          country: event.country,

          startDateTime: this.eventFormService.formatDateTime(
            new Date(event.startDateTime)
          ),

          endDateTime: this.eventFormService.formatDateTime(
            new Date(event.endDateTime)
          ),

          capacity: event.capacity,
        });
      },

      error: (err) => {
        console.error('Failed to load event', err);
      },
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.editEventForm.get(controlName);

    return !!(
      control?.errors?.[errorName] &&
      control.touched
    );
  }

  onSubmit() {
    if (!this.eventID || this.editEventForm.invalid) {
      return;
    }

    const raw = this.editEventForm.value;

    const payload: Partial<EventPayload> = {
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

    this.eventService.updateEvent(this.eventID, payload).subscribe({
      next: () => {
        void this.router.navigate(['/manage-events']);
      },
      error: (err) => {
        console.error('Failed to update event', err);
      },
    });
  }
}
