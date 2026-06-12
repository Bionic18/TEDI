import {Component, inject} from '@angular/core';
import {Event} from '../../../core/models/events';
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

  ngOnInit() {
    const currentUser = this.authService.currentUser;

    if(!currentUser){
      return;
    }
    this.events = this.eventService.getEventsByOrganizer(currentUser.username);
  }
}
