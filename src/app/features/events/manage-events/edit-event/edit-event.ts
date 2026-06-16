import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EventService} from '../../../../core/services/event-service';
import {Event} from '../../../../core/models/events';
import {EventFormService} from '../../../../core/services/event-form-service';

@Component({
  selector: 'app-edit-event',
  standalone: false,
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.css',
})

//ADD AN EVENT-NOT-FOUND PAGE AND A ROUTE GUARD FOR NON-USERS/EVENT FOR USERS THAT HAVEN'T CREATED IT
export class EditEvent {
  eventID: number | null = null;
  currentEvent : Event | undefined = undefined;
  constructor( private route: ActivatedRoute) {}
  eventService = inject(EventService);
  eventFormService = inject(EventFormService);
  editEventForm = this.eventFormService.createForm();
  router = inject(Router);
  ngOnInit() {
    this.eventID = Number(this.route.snapshot.paramMap.get("id"));
    this.currentEvent = this.eventService.getEventByID(this.eventID);
    if (this.currentEvent) {

      this.editEventForm.patchValue({

        name: this.currentEvent.name,
        description: this.currentEvent.description,

        venue: this.currentEvent.venue,
        address: this.currentEvent.address,
        city: this.currentEvent.city,
        country: this.currentEvent.country,
        startDateTime: this.currentEvent.startDateTime
          ? this.eventFormService.formatDateTime(this.currentEvent.startDateTime)
          : '',
        endDateTime: this.currentEvent.endDateTime
          ? this.eventFormService.formatDateTime(this.currentEvent.endDateTime)
          : '',

        capacity: this.currentEvent.capacity

      });
    }
  }
  hasError(controlName: string, errorName: string): boolean { //THIS IS VERY SLOPPY
    const control = this.editEventForm.get(controlName);

    return !!(
      control?.errors?.[errorName] &&
      control.touched
    );
  }
  onSubmit() {

    if (!this.currentEvent) {
      return;
    }

    const formValue =
      this.editEventForm.value;

    const updatedEvent: Event = {

      ...this.currentEvent,

      name: formValue.name!,
      description: formValue.description!,

      venue: formValue.venue!,
      address: formValue.address!,
      city: formValue.city!,
      country: formValue.country!,

      startDateTime: new Date(formValue.startDateTime!),

      endDateTime: new Date(formValue.endDateTime!),

      capacity: Number(formValue.capacity)

    };

    this.eventService.updateEvent(updatedEvent);
    this.router.navigate(['/manage-events']);
  }

}
