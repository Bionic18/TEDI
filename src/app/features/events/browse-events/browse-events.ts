import { Component, computed, inject, signal } from '@angular/core';
import { EventService } from '../../../core/services/event-service';
import { RecommendationService } from '../../../core/services/recommendation-service';
import { AuthService } from '../../../core/services/auth-service';
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
  private recommendationService = inject(RecommendationService);
  authService = inject(AuthService);

  // We use signals so that the UI updates automatically when events or filters change.
  events = signal<Event[]>([]);

  searchTerm = signal('');
  locationTerm = signal('');
  startDate = signal('');
  endDate = signal('');

  minPrice = signal('');
  maxPrice = signal('');

  showRecommendedOnly = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  currentPage = signal(1);
  pageSize = 5;
  filteredEvents = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const location = this.locationTerm().trim().toLowerCase();
    const start = this.startDate();
    const end = this.endDate();
    const minPrice = this.minPrice();
    const maxPrice = this.maxPrice();

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
      const minPriceNumber =
        minPrice === '' ? null : Number(minPrice);

      const maxPriceNumber =
        maxPrice === '' ? null : Number(maxPrice);

      const ticketPrices = event.ticketTypes?.map(ticketType => ticketType.price) ?? [];

      const matchesPrice =
        minPriceNumber === null && maxPriceNumber === null
          ? true
          : ticketPrices.some(price => {
            const aboveMin =
              minPriceNumber === null || price >= minPriceNumber;

            const belowMax =
              maxPriceNumber === null || price <= maxPriceNumber;

            return aboveMin && belowMax;
          });
      return (
        matchesSearch &&
        matchesLocation &&
        matchesStartDate &&
        matchesEndDate &&
        matchesPrice
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
    this.loadEvents()
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
    this.minPrice.set('');
    this.maxPrice.set('');
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
  private loadEvents(): void {
    if (this.showRecommendedOnly()) {
      this.loadRecommendedEvents();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        const publicEvents = events.filter(
          event =>
            event.status === EventStatus.Published ||
            event.status === EventStatus.Cancelled
        );

        this.events.set(publicEvents);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.errorMessage.set('Failed to load events.');
        this.isLoading.set(false);
      },
    });
  }

  private loadRecommendedEvents(): void {
    const user = this.authService.currentUser();

    if (!user) {
      this.errorMessage.set('You must be logged in to view recommendations.');
      this.events.set([]);
      return;
    }

    const viewedEventIds = this.getViewedEventIds();

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.recommendationService.getRecommendations(viewedEventIds).subscribe({
      next: (recommendedEvents) => {
        this.events.set(recommendedEvents);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load recommendations', err);
        this.errorMessage.set('Failed to load recommended events.');
        this.isLoading.set(false);
      },
    });
  }

  toggleRecommendedOnly(checked: boolean): void {
    this.showRecommendedOnly.set(checked);
    this.currentPage.set(1);
    this.loadEvents();
  }

  private getViewedEventIds(): number[] {
    const user = this.authService.currentUser();

    if (!user) {
      return [];
    }

    const rawViewedEvents = localStorage.getItem(`viewedEvents-${user.id}`);

    if (!rawViewedEvents) {
      return [];
    }

    try {
      return JSON.parse(rawViewedEvents) as number[];
    } catch {
      return [];
    }
  }
  updateMinPrice(value: string): void {
    this.minPrice.set(value);
    this.currentPage.set(1);
  }

  updateMaxPrice(value: string): void {
    this.maxPrice.set(value);
    this.currentPage.set(1);
  }
}
