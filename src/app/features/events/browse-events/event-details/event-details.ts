import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/services/event-service';
import { Event } from '../../../../core/models/events';

@Component({
  selector: 'app-event-details',
  standalone: false,
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails implements OnInit {
  eventID: number | null = null;
  currentEvent: Event | undefined;
  private eventService = inject(EventService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.eventID = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService
      .getEventByID(this.eventID)
      .subscribe((event) => (this.currentEvent = event));
  }
}
