import { Injectable, Logger } from '@nestjs/common';
import { getActiveCarSubscriptions } from './data/car-subscriptions.data';
import { CAR_SUBSCRIPTION_CRITERIA } from './data/criteria.data';
import { CarSubscriptionRankingQueryDto } from './dto/ranking-request.dto';
import {
  CarSubscriptionCriterionDto,
  CarSubscriptionRankingItemDto,
  CarSubscriptionRankingResponseDto,
  CarSubscriptionScoreBreakdownDto,
} from './dto/ranking-response.dto';
import { CarSubscriptionScoreCalculator } from './calc/score-calculator';
import { CarSubscriptionData } from './interfaces/car-subscription.interface';

@Injectable()
export class CarSubscriptionRankingService {
  private readonly logger = new Logger(CarSubscriptionRankingService.name);

  async getRanking(
    query?: CarSubscriptionRankingQueryDto,
  ): Promise<CarSubscriptionRankingResponseDto> {
    try {
      this.logger.log('Fetching car subscription ranking');
      this.logger.debug(`Query filters: ${JSON.stringify(query)}`);

      let items = getActiveCarSubscriptions();

      if (query) {
        items = this.applyFilters(items, query);
        this.logger.debug(`After filtering: ${items.length} items`);
      }

      if (items.length === 0) {
        const criteria = this.getCriteriaDto();
        const lastUpdated = new Date();
        return {
          items: [],
          total: 0,
          bestOption: {
            id: 0,
            name: '',
            empresa: '',
            rank: 0,
            isBestOption: false,
            logo: '',
            score: 0,
            pricing: { preco_mensal_min: 0, preco_mensal_max: 0, franquia_km: 0 },
            beneficios: {
              manutencao_inclusa: false,
              seguro_incluso: false,
              ipva_incluso: false,
              revisao_inclusa: false,
              observacoes: [],
            },
            desconto: '',
            url_contratacao: '',
            scoreBreakdown: [],
            data_atualizacao: '',
          },
          criteria,
          lastUpdated,
        };
      }

      const ranked = CarSubscriptionScoreCalculator.rank(items);
      const responseItems = ranked.map((item) => this.toRankingItemDto(item));
      let bestOption = responseItems.find((item) => item.rank === 1);

      if (!bestOption) {
        bestOption = responseItems[0];
      }
      if (bestOption && (bestOption.logo === undefined || bestOption.logo === null)) {
        bestOption.logo = '';
      }

      const criteria = this.getCriteriaDto();
      const lastUpdated = this.getMostRecentUpdate(items);

      return {
        items: responseItems,
        total: responseItems.length,
        bestOption,
        criteria,
        lastUpdated,
      };
    } catch (error) {
      this.logger.error('Error fetching car subscription ranking', error.stack);
      throw error;
    }
  }

  async getCriteria(): Promise<CarSubscriptionCriterionDto[]> {
    return this.getCriteriaDto();
  }

  private applyFilters(
    items: CarSubscriptionData[],
    query: CarSubscriptionRankingQueryDto,
  ): CarSubscriptionData[] {
    let filtered = items;

    if (query.companies && query.companies.length > 0) {
      filtered = filtered.filter((item) =>
        query.companies!.some(
          (company) =>
            item.nome.toLowerCase() === company.toLowerCase() ||
            item.empresa.toLowerCase() === company.toLowerCase(),
        ),
      );
    }

    if (query.max_preco_mensal !== undefined) {
      filtered = filtered.filter(
        (item) => item.pricing.preco_mensal_max <= query.max_preco_mensal!,
      );
    }

    if (query.exige_seguro_incluso === true) {
      filtered = filtered.filter((item) => item.beneficios.seguro_incluso);
    }

    return filtered;
  }

  private toRankingItemDto(
    item: CarSubscriptionData & {
      scoreBreakdown?: CarSubscriptionScoreBreakdownDto[];
    },
  ): CarSubscriptionRankingItemDto {
    const ranked = item as CarSubscriptionData & {
      rank?: number;
      isBestOption?: boolean;
      scoreBreakdown?: CarSubscriptionScoreBreakdownDto[];
    };

    return {
      id: item.id,
      name: item.nome,
      empresa: item.empresa,
      rank: ranked.rank || 0,
      isBestOption: ranked.isBestOption || false,
      logo: item.logo,
      score: Number(item.score?.toFixed(2) ?? item.static_score ?? 0),
      pricing: item.pricing,
      beneficios: item.beneficios,
      desconto: item.desconto,
      url_contratacao: item.url_contratacao,
      scoreBreakdown: ranked.scoreBreakdown || [],
      data_atualizacao: item.data_atualizacao.toLocaleDateString('pt-BR'),
    };
  }

  private getCriteriaDto(): CarSubscriptionCriterionDto[] {
    return CAR_SUBSCRIPTION_CRITERIA.map((criterion) => ({
      key: criterion.key,
      name: criterion.name,
      weight: criterion.weight,
      type: criterion.type,
      description: criterion.description,
    }));
  }

  private getMostRecentUpdate(items: CarSubscriptionData[]): Date {
    const dates = items.map((item) => item.data_atualizacao);
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  }
}
