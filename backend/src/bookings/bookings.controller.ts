import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.auth.guard.js';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

interface AuthedRequest {
  user: {
    userId: number;
    username: string;
    roles: string[];
  };
}

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('events/:eventId/bookings')
  create(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: AuthedRequest,
  ) {
    return this.bookingsService.create(
      eventId,
      req.user.userId,
      createBookingDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookings/my')
  findMyBookings(@Req() req: AuthedRequest) {
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('events/:eventId/bookings')
  findEventBookings(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: AuthedRequest,
  ) {
    return this.bookingsService.findEventBookings(
      eventId,
      req.user.userId,
    );
  }
}
