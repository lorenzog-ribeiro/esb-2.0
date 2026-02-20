import { Injectable, Logger } from '@nestjs/common';
import { getActiveDigitalAccounts } from './data/accounts.data';
import { DIGITAL_ACCOUNT_CRITERIA } from './data/criteria.data';
import { DigitalAccountsRankingQueryDto } from './dto/ranking-request.dto';
import {
  DigitalAccountRankingItemDto,
  DigitalAccountsRankingResponseDto,
  DigitalAccountCriterionDto,
  DigitalAccountFeaturesDto,
  DigitalAccountScoreBreakdownDto,
} from './dto/ranking-response.dto';
import { DigitalAccountsScoreCalculator } from './calc/score-calculator';
import { DigitalAccountData } from './interfaces/digital-account-ranking.interface';

@Injectable()
export class DigitalAccountsRankingService {
  private readonly logger = new Logger(DigitalAccountsRankingService.name);

  async getRanking(
    query?: DigitalAccountsRankingQueryDto,
  ): Promise<DigitalAccountsRankingResponseDto> {
    try {
      this.logger.log('Fetching digital accounts ranking');
      this.logger.debug(`Query filters: ${JSON.stringify(query)}`);

      let accounts = getActiveDigitalAccounts();

      if (query) {
        accounts = this.applyFilters(accounts, query);
        this.logger.debug(`After filtering: ${accounts.length} accounts`);
      }

      if (accounts.length === 0) {
        const criteria = this.getCriteriaDto();
        const lastUpdated = new Date();
        return {
          items: [],
          total: 0,
          bestOption: {
            id: 0,
            name: '',
            bank: '',
            rank: 0,
            isBestOption: false,
            logo: '',
            monthly_fee: 0,
            account_type: 'ambos',
            score: 0,
            url_ranking: '',
            call_to_action: '',
            highlights: [],
            features: {
              credit_card: false,
              debit_card: false,
              investments: false,
              boletos: false,
              saques_ilimitados: false,
              atendimento_humanizado: false,
            },
            scoreBreakdown: [],
            data_atualizacao: '',
          },
          criteria,
          lastUpdated,
        };
      }

      const rankedAccounts = DigitalAccountsScoreCalculator.rankAccounts(accounts);

      const items = rankedAccounts.map((account) =>
        this.toRankingItemDto(account),
      );
      let bestOption = items.find((item) => item.rank === 1);

      if (!bestOption) {
        bestOption = items[0];
      }

      const criteria = this.getCriteriaDto();
      const lastUpdated = this.getMostRecentUpdate(accounts);

      return {
        items,
        total: items.length,
        bestOption,
        criteria,
        lastUpdated,
      };
    } catch (error) {
      this.logger.error('Error fetching digital accounts ranking', error.stack);
      throw error;
    }
  }

  async getCriteria(): Promise<DigitalAccountCriterionDto[]> {
    return this.getCriteriaDto();
  }

  private applyFilters(
    accounts: DigitalAccountData[],
    query: DigitalAccountsRankingQueryDto,
  ): DigitalAccountData[] {
    let filtered = accounts;

    if (query.companies && query.companies.length > 0) {
      filtered = filtered.filter((account) =>
        query.companies!.some(
          (company) =>
            account.nome.toLowerCase() === company.toLowerCase() ||
            account.banco.toLowerCase() === company.toLowerCase(),
        ),
      );
    }

    if (query.tipo_conta) {
      filtered = filtered.filter(
        (account) =>
          account.tipo_conta === 'ambos' || account.tipo_conta === query.tipo_conta,
      );
    }

    if (query.max_mensalidade !== undefined) {
      filtered = filtered.filter(
        (account) => account.mensalidade <= query.max_mensalidade!,
      );
    }

    if (query.exige_cartao_credito === true) {
      filtered = filtered.filter((account) => account.features.credit_card);
    }

    if (query.exige_investimentos === true) {
      filtered = filtered.filter((account) => account.features.investments);
    }

    return filtered;
  }

  private toRankingItemDto(
    account: DigitalAccountData & {
      scoreBreakdown?: DigitalAccountScoreBreakdownDto[];
    },
  ): DigitalAccountRankingItemDto {
    const ranked = account as DigitalAccountData & {
      rank?: number;
      isBestOption?: boolean;
      scoreBreakdown?: DigitalAccountScoreBreakdownDto[];
    };

    return {
      id: account.id,
      name: account.nome,
      bank: account.banco,
      rank: ranked.rank || 0,
      isBestOption: ranked.isBestOption || false,
      logo: account.logo,
      monthly_fee: account.mensalidade,
      account_type: account.tipo_conta,
      score: Number(account.score?.toFixed(2) ?? account.static_score),
      url_ranking: account.url_ranking,
      call_to_action: account.botao,
      highlights: account.destaques,
      features: this.toFeaturesDto(account),
      scoreBreakdown: ranked.scoreBreakdown || [],
      data_atualizacao: account.data_atualizacao.toLocaleDateString('pt-BR'),
    };
  }

  private toFeaturesDto(account: DigitalAccountData): DigitalAccountFeaturesDto {
    return {
      credit_card: account.features.credit_card,
      debit_card: account.features.debit_card,
      investments: account.features.investments,
      boletos: account.features.boletos,
      saques_ilimitados: account.features.saques_ilimitados,
      atendimento_humanizado: account.features.atendimento_humanizado,
    };
  }

  private getCriteriaDto(): DigitalAccountCriterionDto[] {
    return DIGITAL_ACCOUNT_CRITERIA.map((criterion) => ({
      key: criterion.key,
      name: criterion.name,
      weight: criterion.weight,
      type: criterion.type,
      description: criterion.description,
    }));
  }

  private getMostRecentUpdate(accounts: DigitalAccountData[]): Date {
    const dates = accounts.map((account) => account.data_atualizacao);
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  }
}
