import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';

export class RecommendationsRequestDto {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  viewedEventIds?: number[];
}
