import {Component, inject} from '@angular/core';
import {Event, EventStatus} from '../../../core/models/events';
import {EventService} from '../../../core/services/event-service';
import {AuthService} from '../../../core/services/auth-service';

@Component({
  selector: 'app-manage-events',
  standalone: false,
  templateUrl: './manage-events.html',
  styleUrl: './manage-events.css',
})
//WOuld like to add a view for draft events in the future
export class ManageEvents {
  eventService = inject(EventService);
  authService = inject(AuthService);
  events: Event[] =[];
  drafts: Event[]=[];
  nonDrafts :Event[]=[];
  ngOnInit() {
    const currentUser = this.authService.currentUser;

    if(!currentUser){
      return;
    }
    this.loadEvents();
  }
  deleteDraft(eventID: number): void {

    const confirmed = confirm(
      'Are you sure you want to permanently delete this draft?'
    );

    if (!confirmed) {
      return;
    }

    this.eventService.deleteEvent(eventID);

    this.loadEvents();
  }
  loadEvents(): void {

    this.events =
      this.eventService.getEventsByOrganizer(
        this.authService.currentUser!.username
      );
    this.nonDrafts =
      this.events.filter(
        event => event.status !== EventStatus.Draft
      );

    this.drafts =
      this.events.filter(
        event => event.status === EventStatus.Draft
      );
  }
  publishEvent(eventID: number): void {

    this.eventService.publishEvent(eventID);

    this.loadEvents();

  }
}
