import {EventStatus} from './eventStatus';

export interface Event {
  id: number;

  name: string;
  description: string;

  venue: string;
  address: string;
  city: string;
  country: string;

  startDateTime: Date | string;
  endDateTime: Date | string;

  capacity: number;

  status: EventStatus;

  organizerId: number;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
