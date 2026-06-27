import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.auth.guard.js';
import { RecommendationsRequestDto } from './dto/recommendations-request.dto.js';
import { RecommendationsService } from './recommendations.service.js';

interface AuthedRequest {
  user: {
    userId: number;
    username: string;
    roles: string[];
  };
}

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  recommend(
    @Req() req: AuthedRequest,
    @Body() body: RecommendationsRequestDto,
  ) {
    return this.recommendationsService.recommendForUser(
      req.user.userId,
      body.viewedEventIds ?? [],
    );
  }
}
