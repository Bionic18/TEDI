import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {EventService} from '../../../../core/services/event-service';
import {Event} from '../../../../core/models/events';
import {EventFormService} from '../../../../core/services/event-form-service';

@Component({
  selector: 'app-edit-event',
  standalone: false,
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.css',
})

export class EditEvent {
  eventID: number | null = null;
  currentEvent : Event | undefined = undefined;
  constructor( private route: ActivatedRoute) {}
  eventService = inject(EventService);
  eventFormService = inject(EventFormService);
  editEventForm = this.eventFormService.createForm();
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
        startDateTime:this.eventFormService.formatDateTime(this.currentEvent.startDateTime),
        endDateTime: this.eventFormService.formatDateTime(this.currentEvent.endDateTime),
        capacity: this.currentEvent.capacity

      });
      console.log(this.currentEvent.startDateTime.toISOString())
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
    console.log(this.editEventForm.value);
  } //TEMPORRARY

}
