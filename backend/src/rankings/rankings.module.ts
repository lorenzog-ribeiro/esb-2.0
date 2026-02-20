import { Module } from '@nestjs/common';
import { CardMachinesRankingModule } from './card-machines/card-machines-ranking.module';
import { InsuranceRankingModule } from './insurance/insurance-ranking.module';
import { DigitalAccountsRankingModule } from './digital-accounts/digital-accounts-ranking.module';
import { TollPassesRankingModule } from './toll-passes/toll-passes-ranking.module';
import { CarSubscriptionRankingModule } from './car-subscription/car-subscription-ranking.module';
import { RealEstateRankingModule } from './real-estate/real-estate-ranking.module';

/**
 * Rankings Module
 *
 * Modulo raiz de todos os rankings do ESB 2.0.
 *
 * Rankings disponíveis:
 * - Card Machines Ranking   (card-machines)
 * - Insurance Ranking       (insurance)
 * - Digital Accounts Ranking(digital-accounts)
 * - Toll Passes Ranking     (toll-passes)
 * - Car Subscription Ranking(car-subscription)
 * - Real Estate Ranking     (real-estate) — migrado de top_imoveis()
 *
 * Rankings sao SEPARADOS dos Simuladores:
 * - Simuladores: calculam com base no input do usuario
 * - Rankings: exibem listas pre-ranqueadas com filtros opcionais
 */
@Module({
  imports: [
    CardMachinesRankingModule,
    InsuranceRankingModule,
    DigitalAccountsRankingModule,
    TollPassesRankingModule,
    CarSubscriptionRankingModule,
    RealEstateRankingModule,
  ],
  exports: [
    CardMachinesRankingModule,
    InsuranceRankingModule,
    DigitalAccountsRankingModule,
    TollPassesRankingModule,
    CarSubscriptionRankingModule,
    RealEstateRankingModule,
  ],
})
export class RankingsModule {}
