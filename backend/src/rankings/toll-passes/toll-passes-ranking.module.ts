import { Module } from '@nestjs/common';
import { TollPassesRankingService } from './toll-passes-ranking.service';
import { TollPassesRankingController } from './toll-passes-ranking.controller';

@Module({
  imports: [],
  controllers: [TollPassesRankingController],
  providers: [TollPassesRankingService],
  exports: [TollPassesRankingService],
})
export class TollPassesRankingModule {}
