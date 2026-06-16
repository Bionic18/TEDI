import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

// The organizer is taken from the authenticated user (JWT), so it is NOT part
// of the request body. The same goes for id and status, which are managed by
// the server.
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  // ISO 8601 strings, e.g. "2026-06-19T20:00:00".
  @IsDateString()
  startDateTime: string;

  @IsDateString()
  endDateTime: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;
}
