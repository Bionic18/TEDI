export enum EventStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED'
}

export interface Event {
  id: number;
  name: string;
  description: string;

  organizerUsername: string;



  venue: string;
  address: string;
  city: string;
  country: string;

  startDateTime: Date;
  endDateTime: Date;

  capacity: number;

  status: EventStatus;

} //TEMPORARY UNTIL ACTUAL DATA COMES. WAY MORE FIELDS NEED TO BE ADDED.
