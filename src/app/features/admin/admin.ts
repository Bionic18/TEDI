import { Component, inject, signal } from '@angular/core';
import {EventService} from '../../core/services/event-service';
import {Event} from '../../core/models/events';
import { UserService, AdminUser } from '../../core/services/user-service';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private eventService = inject(EventService);
  private userService = inject(UserService);

  users = signal<AdminUser[]>([]);
  selectedUserId = signal<number | null>(null);
  userManagementErrorMessage = signal('');
  isLoadingUsers = signal(false);

  events = signal<Event[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadEvents();
    this.loadUsers();
  }

  loadEvents(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load events for admin export', err);
        this.errorMessage.set('Failed to load events.');
        this.isLoading.set(false);
      },
    });
  }

  exportJson(): void {
    const json = JSON.stringify(this.events(), null, 2);

    this.downloadFile(
      json,
      'events-export.json',
      'application/json'
    );
  }

  exportXml(): void {
    const xml = this.buildEventsXml(this.events());

    this.downloadFile(
      xml,
      'events-export.xml',
      'application/xml'
    );
  }

  private buildEventsXml(events: Event[]): string {
    const eventElements = events
      .map(event => this.buildEventXml(event))
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Events>
${eventElements}
</Events>`;
  }

  private buildEventXml(event: Event): string {
    const title = this.escapeXml(event.name);
    const description = this.escapeXml(event.description);
    const venue = this.escapeXml(event.venue);
    const address = this.escapeXml(event.address);
    const city = this.escapeXml(event.city);
    const country = this.escapeXml(event.country);
    const status = this.escapeXml(event.status);
    const capacity = this.escapeXml(event.capacity);
    const organizerId = this.escapeXml(event.organizerId);

    return `  <Event EventID="EV${event.id}">
    <Title>${title}</Title>
    <Category>General</Category>
    <EventType>General</EventType>
    <Venue>${venue}</Venue>
    <Address>${address}</Address>
    <City>${city}</City>
    <Country>${country}</Country>
    <StartDateTime>${this.escapeXml(event.startDateTime)}</StartDateTime>
    <EndDateTime>${this.escapeXml(event.endDateTime)}</EndDateTime>
    <Capacity>${capacity}</Capacity>
    <TicketTypes>
      <TicketType TicketTypeID="T${event.id}-DEFAULT">
        <Name>Default</Name>
        <Price>0</Price>
        <Quantity>${capacity}</Quantity>
        <Available>${capacity}</Available>
      </TicketType>
    </TicketTypes>
    <Bookings>
    </Bookings>
    <Organizer UserID="${organizerId}"/>
    <Status>${status}</Status>
    <Description>${description}</Description>
  </Event>`;
  }

  private escapeXml(value: unknown): string { //helper function to ensure event chracters are XML safe
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType }); //create temporary blob for file to download
    const url = URL.createObjectURL(blob); //create temporary url for blb

    const link = document.createElement('a'); //make fake <a> element and click it through code
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url); //delete temporary url
  }
  private loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.userManagementErrorMessage.set('');

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoadingUsers.set(false);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.userManagementErrorMessage.set('Failed to load users.');
        this.isLoadingUsers.set(false);
      },
    });
  }

  toggleUserDetails(userId: number): void {
    this.selectedUserId.set(
      this.selectedUserId() === userId ? null : userId
    );
  }

  approveUser(userId: number): void {
    this.userService.approveUser(userId).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        console.error('Failed to approve user', err);
        this.userManagementErrorMessage.set('Failed to approve user.');
      },
    });
  }

  rejectUser(userId: number): void {
    const confirmed = confirm(
      'Are you sure you want to reject this pending user registration?'
    );
    if (!confirmed) {
      return;
    }

    this.userService.rejectUser(userId).subscribe({
      next: () => this.loadUsers(),
      error: () => {
        this.userManagementErrorMessage.set('Failed to reject pending user.');
        this.userManagementErrorMessage.set('Failed to reject user.');
      },
    });
  }
}
