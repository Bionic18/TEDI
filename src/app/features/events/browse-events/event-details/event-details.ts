import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {EventService} from '../../../../core/services/event-service';
import {Event} from '../../../../core/models/events';

@Component({
  selector: 'app-event-details',
  standalone: false,
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  eventID: number | null = null;
  currentEvent: Event | undefined;
  eventService = inject(EventService);
  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    this.eventID = Number(
      this.route.snapshot.paramMap.get('id')
    );
    this.currentEvent = this.eventService.getEventByID(this.eventID);
  }
}
