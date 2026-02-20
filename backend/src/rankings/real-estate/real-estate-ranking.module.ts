/**
 * real-estate-ranking.module.ts
 *
 * Modulo NestJS para o Ranking de Imoveis.
 * Usa dados estaticos (real-estate.data.ts) sem dependencia de banco legado.
 */

import { Module } from '@nestjs/common';
import { RealEstateRankingController } from './real-estate-ranking.controller';
import { RealEstateRankingService } from './real-estate-ranking.service';

@Module({
  controllers: [RealEstateRankingController],
  providers: [RealEstateRankingService],
  exports: [RealEstateRankingService],
})
export class RealEstateRankingModule {}
