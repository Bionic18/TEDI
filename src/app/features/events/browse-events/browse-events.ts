import { Component, computed, inject, signal } from '@angular/core';
import { EventService } from '../../../core/services/event-service';
import { Event } from '../../../core/models/events';
import { EventStatus } from '../../../core/models/eventStatus';

@Component({
  selector: 'app-browse-events',
  standalone: false,
  templateUrl: './browse-events.html',
  styleUrl: './browse-events.css',
})
export class BrowseEvents {
  private eventService = inject(EventService);
//we use signals so that the data is continuously updated
  events = signal<Event[]>([]);

  searchTerm = signal('');
  locationTerm = signal('');
  startDate = signal('');
  endDate = signal('');

  currentPage = signal(1);
  pageSize = 5; //5 events in each page

  filteredEvents = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const location = this.locationTerm().trim().toLowerCase();
    const start = this.startDate();
    const end = this.endDate();

    return this.events().filter(event => {
      const matchesSearch =
        !search ||
        event.name.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search);

      const locationText = [
        event.venue,
        event.address,
        event.city,
        event.country,
      ]
        .join(' ')
        .toLowerCase();

      const matchesLocation =
        !location || locationText.includes(location);

      const eventStartDate = new Date(event.startDateTime);

      const matchesStartDate =
        !start || eventStartDate >= new Date(start);

      const matchesEndDate =
        !end || eventStartDate <= new Date(end);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredEvents().length / this.pageSize));
  });

  paginatedEvents = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    return this.filteredEvents().slice(startIndex, endIndex);
  });

  ngOnInit() {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        const publicEvents = events.filter(
          event =>
            event.status === EventStatus.Published ||
            event.status === EventStatus.Cancelled
        );

        this.events.set(publicEvents);
      },
      error: (err) => {
        console.error('Failed to load events', err);
      },
    });
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  updateLocationTerm(value: string): void {
    this.locationTerm.set(value);
    this.currentPage.set(1);
  }

  updateStartDate(value: string): void {
    this.startDate.set(value);
    this.currentPage.set(1);
  }

  updateEndDate(value: string): void {
    this.endDate.set(value);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.locationTerm.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.currentPage.set(1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }
}
