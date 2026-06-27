import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Event } from '../models/events';
import { EventStatus } from '../models/eventStatus';


export function dateRangeValidator(control :AbstractControl): ValidationErrors | null {
  const start = control.get('startDateTime')?.value;
  const end = control.get('endDateTime')?.value;

  if (!start || !end){ //if one of the dates is null -> return null( no error)
    return null;
  }
  if(new Date(start) >= new Date(end)) {
    return {invalidDateRange: true};
  }
  return null;
}
export function whitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value){
    return null;
  }
  return value.trim() === ''
    ? { isOnlyWhitespace: true }
    : null;
}

export function ticketTypesCapacityValidator(control: AbstractControl): ValidationErrors | null {
  const capacity = Number(control.get('capacity')?.value);
  const ticketTypes = control.get('ticketTypes') as FormArray | null;

  if (!capacity || !ticketTypes) {
    return null;
  }

  const totalTicketQuantity = ticketTypes.controls.reduce((sum, ticketTypeControl) => {
    const quantity = Number(ticketTypeControl.get('quantity')?.value || 0);
    return sum + quantity;
  }, 0);

  return totalTicketQuantity > capacity
    ? { ticketTypesExceedCapacity: true }
    : null;
}

@Injectable({
  providedIn: 'root',
})
export class EventFormService {
  createForm(): FormGroup {
    return new FormGroup(
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
        ticketTypes: new FormArray([
          this.createTicketTypeGroup(),
        ]),
      },
      {
        validators: [dateRangeValidator, ticketTypesCapacityValidator],
      },
    );
  }
  formatDateTime(date: Date): string { //helper function to convert Date object into the HTML dateTimeLocal format. Adapted from:https://stackoverflow.com/questions/28760254/assign-javascript-date-to-html5-datetime-local-input

    return (new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()).slice(0, -1);
  }
  //
  // fillEventFromForm(input_form :FormGroup,input_status: EventStatus, input_id :number,input_organizerID :number ): Event {
  //   const formValue = input_form.value;
  //   return {
  //     id: input_id,
  //     name: formValue.name!,
  //     description: formValue.description!,
  //
  //     organizerId: input_organizerID,
  //
  //     venue: formValue.venue!,
  //     address: formValue.address!,
  //     city: formValue.city!,
  //     country: formValue.country!,
  //
  //     startDateTime: formValue.startDateTime
  //       ? new Date(formValue.startDateTime)
  //       : "",
  //
  //     endDateTime: formValue.endDateTime
  //       ? new Date(formValue.endDateTime)
  //       : "",
  //
  //     capacity: Number(formValue.capacity),
  //     status: input_status
  //   }
  // }
  createTicketTypeGroup(
    name = 'General Admission',
    price = 0,
    quantity = 1,
  ): FormGroup {
    return new FormGroup({
      name: new FormControl(name, [
        Validators.required,
        whitespaceValidator,
      ]),
      price: new FormControl(price, [
        Validators.required,
        Validators.min(0),
      ]),
      quantity: new FormControl(quantity, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }
}
