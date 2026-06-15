import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

// All fields of CreateEventDto become optional for updates. We additionally
// allow changing the status (e.g. DRAFT -> PUBLISHED to publish an event, or
// PUBLISHED -> CANCELLED to cancel one).
export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}
