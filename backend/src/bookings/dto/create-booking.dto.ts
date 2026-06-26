import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ticketTypeId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  numberOfTickets: number;
}
