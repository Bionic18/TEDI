import {Component, inject} from '@angular/core';
import {EventService} from '../../../core/services/event-service';
import {EventStatus} from '../../../core/models/events';

@Component({
  selector: 'app-browse-events',
  standalone: false,
  templateUrl: './browse-events.html',
  styleUrl: './browse-events.css',
})
export class BrowseEvents {
  eventService = inject(EventService);
  events = this.eventService.getAllEvents(EventStatus.Published);
}
