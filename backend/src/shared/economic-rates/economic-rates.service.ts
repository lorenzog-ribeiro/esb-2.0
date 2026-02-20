import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { EconomicRates } from './economic-rates.interface';

/**
 * Resposta da API do Banco Central (BCB) - Série histórica
 */
interface BancoCentralApiResponse {
  data: string;
  valor: string;
}

/**
 * Serviço centralizado para taxas macroeconômicas (SELIC, CDI, TR).
 *
 * - Fonte: API do Banco Central (BCB)
 * - Cache in-memory com TTL configurável (default 1h)
 * - Fallback: variáveis de ambiente FALLBACK_SELIC, FALLBACK_CDI, FALLBACK_TR
 * - Valores default quando API e env falham (compatíveis com legacy Django)
 *
 * Série BCB:
 * - 432: Meta SELIC (% a.a.)
 * - 12: CDI diário (%)
 * - 226: TR (%)
 */
@Injectable()
export class EconomicRatesService {
  private readonly logger = new Logger(EconomicRatesService.name);

  private cache: EconomicRates | null = null;
  private cacheExpiry = 0;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

  private readonly BCB_SELIC_URL =
    'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json';
  private readonly BCB_CDI_URL =
    'https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json';
  private readonly BCB_TR_URL =
    'https://api.bcb.gov.br/dados/serie/bcdata.sgs.226/dados/ultimos/1?formato=json';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Retorna taxas macroeconômicas atuais (com cache).
   * Prioridade: cache → BCB → env vars → default.
   */
  async getRates(): Promise<EconomicRates> {
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const [selicAnual, cdiAnual, trMensal] = await Promise.all([
        this.fetchSelic(),
        this.fetchCdi(),
        this.fetchTr(),
      ]);

      const trFactor = 1 + trMensal; // trMensal já em decimal (ex: 0.002)

      this.cache = { selicAnual, cdiAnual, trMensal, trFactor };
      this.cacheExpiry = Date.now() + this.CACHE_TTL_MS;

      this.logger.debug(
        `Economic rates cached: Selic=${selicAnual}%, CDI=${cdiAnual}%, TR=${trMensal} (factor=${trFactor})`,
      );

      return this.cache;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch economic rates, using fallback: ${(error as Error).message}`,
      );
      return this.getFallbackRates();
    }
  }

  /**
   * Retorna apenas o fator TR (1 + TR/100) para correção de saldo.
   * Usado em simulador de amortização - compatível com Django (1.002).
   */
  async getTrFactor(): Promise<number> {
    const rates = await this.getRates();
    return rates.trFactor;
  }

  /**
   * Retorna apenas SELIC anual (%). Usado em renda fixa, comparador carro.
   */
  async getSelicAnual(): Promise<number> {
    const rates = await this.getRates();
    return rates.selicAnual;
  }

  /**
   * Retorna apenas CDI anual (%). Usado em renda fixa.
   */
  async getCdiAnual(): Promise<number> {
    const rates = await this.getRates();
    return rates.cdiAnual;
  }

  /**
   * Retorna apenas TR mensal em decimal. Usado em renda fixa (poupança).
   */
  async getTrMensal(): Promise<number> {
    const rates = await this.getRates();
    return rates.trMensal;
  }

  /**
   * Invalida o cache (útil para testes ou quando forçar refetch).
   */
  invalidateCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }

  private async fetchSelic(): Promise<number> {
    try {
      const response: AxiosResponse<BancoCentralApiResponse[]> =
        await firstValueFrom(
          this.httpService.get<BancoCentralApiResponse[]>(this.BCB_SELIC_URL, {
            timeout: 5000,
          }),
        );
      const valorStr = response.data[0]?.valor?.replace(',', '.');
      if (!valorStr) throw new Error('Selic value not found');
      const valor = parseFloat(valorStr);
      this.logger.debug(`Selic from BCB: ${valor}%`);
      return valor;
    } catch (error) {
      const fallback =
        this.configService.get<number>('FALLBACK_SELIC') ?? 13.75;
      this.logger.warn(`Selic fallback: ${fallback}%`);
      return fallback;
    }
  }

  private async fetchCdi(): Promise<number> {
    try {
      const response: AxiosResponse<BancoCentralApiResponse[]> =
        await firstValueFrom(
          this.httpService.get<BancoCentralApiResponse[]>(this.BCB_CDI_URL, {
            timeout: 5000,
          }),
        );
      const valorStr = response.data[0]?.valor?.replace(',', '.');
      if (!valorStr) throw new Error('CDI value not found');
      const cdiDiario = parseFloat(valorStr);
      // CDI diário → anual: ((1 + diario/100)^252 - 1) * 100
      const cdiAnual = (Math.pow(1 + cdiDiario / 100, 252) - 1) * 100;
      this.logger.debug(`CDI from BCB: ${cdiAnual.toFixed(2)}% (daily ${cdiDiario}%)`);
      return parseFloat(cdiAnual.toFixed(2));
    } catch (error) {
      const fallback =
        this.configService.get<number>('FALLBACK_CDI') ?? 13.65;
      this.logger.warn(`CDI fallback: ${fallback}%`);
      return fallback;
    }
  }

  private async fetchTr(): Promise<number> {
    try {
      const response: AxiosResponse<BancoCentralApiResponse[]> =
        await firstValueFrom(
          this.httpService.get<BancoCentralApiResponse[]>(this.BCB_TR_URL, {
            timeout: 5000,
          }),
        );
      const valorStr = response.data[0]?.valor?.replace(',', '.');
      if (!valorStr) throw new Error('TR value not found');
      const trPercentual = parseFloat(valorStr);
      const trDecimal = trPercentual / 100;
      this.logger.debug(`TR from BCB: ${trPercentual}% (decimal ${trDecimal})`);
      return trDecimal;
    } catch (error) {
      // Django legacy usa 1.002 → TR 0.2% → decimal 0.002
      const fallbackPercent =
        this.configService.get<number>('FALLBACK_TR') ?? 0.2;
      const trDecimal = fallbackPercent / 100;
      this.logger.warn(`TR fallback: ${fallbackPercent}% (decimal ${trDecimal})`);
      return trDecimal;
    }
  }

  private getFallbackRates(): EconomicRates {
    const selicAnual =
      this.configService.get<number>('FALLBACK_SELIC') ?? 13.75;
    const cdiAnual = this.configService.get<number>('FALLBACK_CDI') ?? 13.65;
    const trPercent = this.configService.get<number>('FALLBACK_TR') ?? 0.2;
    const trMensal = trPercent / 100;

    return {
      selicAnual,
      cdiAnual,
      trMensal,
      trFactor: 1 + trMensal,
    };
  }
}
