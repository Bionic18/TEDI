// Plain shape of an Event row, used for typing service results. Mirrors the
// Event model in prisma/schema.prisma.
export class Event {
  id: number;
  name: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  startDateTime: Date;
  endDateTime: Date;
  capacity: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  organizerId: number;
  createdAt: Date;
  updatedAt: Date;
}
