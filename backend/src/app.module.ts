import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';

@Module({
  imports: [  UsersModule,
    PrismaModule,
    AuthModule,
    EventsModule,
    BookingsModule,
    RecommendationsModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
