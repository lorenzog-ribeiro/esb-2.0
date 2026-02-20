import { Module } from '@nestjs/common';
import { DigitalAccountsRankingService } from './digital-accounts-ranking.service';
import { DigitalAccountsRankingController } from './digital-accounts-ranking.controller';

@Module({
  imports: [],
  controllers: [DigitalAccountsRankingController],
  providers: [DigitalAccountsRankingService],
  exports: [DigitalAccountsRankingService],
})
export class DigitalAccountsRankingModule {}
