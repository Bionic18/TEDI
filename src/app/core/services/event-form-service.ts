import { Injectable } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';

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

@Injectable({
  providedIn: 'root',
})


export class EventFormService {
  createForm() :FormGroup {
    return new FormGroup({
      name: new FormControl('',[Validators.required,whitespaceValidator]),
      description: new FormControl('',[Validators.required,whitespaceValidator]),
      venue: new FormControl('',[Validators.required,whitespaceValidator]),
      address: new FormControl('',[Validators.required,whitespaceValidator]),
      city: new FormControl('',[Validators.required,whitespaceValidator]),
      country: new FormControl('',[Validators.required,whitespaceValidator]),
      startDateTime: new FormControl('',Validators.required), //It'd be nice to have a validator where it checks whether the TIME is needed and say that only.
      endDateTime: new FormControl('',Validators.required),
      capacity: new FormControl('',[Validators.required,Validators.min(1)]),
    },{
      validators: dateRangeValidator //more validators to be added
    });
  }
  formatDateTime(date: Date): string { //helper function to convert Date object into the HTML dateTimeLocal format. Adapted from:https://stackoverflow.com/questions/28760254/assign-javascript-date-to-html5-datetime-local-input

    return (new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()).slice(0, -1);
  }
}
