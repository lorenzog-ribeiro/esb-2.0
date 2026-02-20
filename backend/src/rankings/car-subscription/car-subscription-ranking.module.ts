import { Module } from '@nestjs/common';
import { CarSubscriptionRankingService } from './car-subscription-ranking.service';
import { CarSubscriptionRankingController } from './car-subscription-ranking.controller';

@Module({
  imports: [],
  controllers: [CarSubscriptionRankingController],
  providers: [CarSubscriptionRankingService],
  exports: [CarSubscriptionRankingService],
})
export class CarSubscriptionRankingModule {}
