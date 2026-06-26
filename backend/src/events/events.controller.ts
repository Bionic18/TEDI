import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { EventsService, FindAllFilter } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';
import { EventStatus } from '../generated/prisma/client.mjs';

// Shape of req.user, populated by JwtStrategy.validate().
interface AuthedRequest {
  user: { userId: number; username: string; roles: string[] };
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Public: guests can browse / search events.
  // Optional filters: ?status=PUBLISHED and/or ?organizerId=<id>
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('organizerId') organizerId?: string,
  ) {
    const filter: FindAllFilter = {};
    if (status) {
      filter.status = status as EventStatus;
    }
    if (organizerId) {
      filter.organizerId = Number(organizerId);
    }
    return this.eventsService.findAll(filter);
  }

  // Public: anyone can view the details of a single event.
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  // Authenticated: any registered user can create an event and becomes its
  // organizer.
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createEventDto: CreateEventDto, @Req() req: AuthedRequest) {
    return this.eventsService.create(createEventDto, req.user.userId);
  }

  // Authenticated + must be the organizer of the event (checked in the service).
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: AuthedRequest,
  ) {
    return this.eventsService.update(id, updateEventDto, req.user.userId);
  }
// Authenticated + must be the organizer. Publishes a draft event.
  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
    return this.eventsService.publish(id, req.user.userId);
  }

// Authenticated + must be the organizer. Cancels a published event.
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
    return this.eventsService.cancel(id, req.user.userId);
  }
  // Authenticated + must be the organizer. Only DRAFT events can be deleted.
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
    return this.eventsService.remove(id, req.user.userId);
  }
}
