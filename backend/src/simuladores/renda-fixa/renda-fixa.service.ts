import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { SimularRendaFixaDto } from './dto/simular-renda-fixa.dto';
import {
  ResultadoRendaFixaDto,
  ResultadoModalidadeDto,
} from './dto/resultado-renda-fixa.dto';
import {
  InvestimentoOfertaDto,
  OfertaTesouroDto,
} from './dto/investimento-oferta.dto';
import {
  calcularInvestimentosRendaFixa,
  InvestimentosRendaFixa,
} from './calc/renda-fixa.calc';
import { PrismaService } from '../../prisma/prisma.service';
import { SimulatorType } from '@prisma/client';
import {
  RendaFixaApiClient,
  OfertaInvestimento,
  OfertaTesouro,
  API_TO_SYSTEM_MAP,
} from './clients/renda-fixa-api.client';
import { EmailService } from '../../email/email.service';
import { EconomicRatesService } from '../../shared/economic-rates/economic-rates.service';

@Injectable()
export class RendaFixaService {
  private readonly logger = new Logger(RendaFixaService.name);

  constructor(
    private readonly economicRates: EconomicRatesService,
    private readonly prisma: PrismaService,
    private readonly rendaFixaApiClient: RendaFixaApiClient,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Simula investimentos em renda fixa comparando diferentes modalidades
   *
   * Compara:
   * - Poupança (isenta de IR)
   * - Tesouro Direto Selic (com IR)
   * - LCI - 90% CDI (isenta de IR)
   * - CDB - 110% CDI (com IR)
   *
   * @param dto - Dados da simulação
   * @returns Resultado comparativo entre as modalidades
   */
  async simular(dto: SimularRendaFixaDto): Promise<ResultadoRendaFixaDto> {
    try {
      this.logger.log('Starting fixed income simulation');
      const redactedDto = { ...dto, email: '***', nome: '***' };
      this.logger.debug(`Input: ${JSON.stringify(redactedDto)}`);

      // Taxas macroeconômicas via EconomicRatesService (BCB + cache + fallback)
      const rates = await this.economicRates.getRates();
      const { selicAnual, cdiAnual, trMensal } = rates;

      this.logger.debug(
        `Economic rates: Selic=${selicAnual}%, CDI=${cdiAnual}%, TR=${trMensal} (factor=${rates.trFactor})`,
      );

      // CRITICAL: Call external API FIRST to get CDB and LCI values (as legacy does)
      let apiResponse: any = null;
      try {
        apiResponse = await this.rendaFixaApiClient.consultarOfertas(
          dto.investimentoInicial,
          dto.prazoMeses,
        );
        this.logger.debug(
          `External API response received: ${JSON.stringify(apiResponse)}`,
        );
      } catch (error) {
        this.logger.warn(
          'Failed to fetch from external API, will use local calculations as fallback',
          error.message,
        );
      }

      // Realizar os cálculos
      // - Poupança e SELIC: calculados localmente (como legacy faz)
      // - CDB e LCI: usar valores da API externa (como legacy faz)
      const resultados = calcularInvestimentosRendaFixa(
        dto.investimentoInicial,
        dto.prazoMeses,
        selicAnual,
        cdiAnual,
        trMensal,
        apiResponse, // Pass API response to use its CDB/LCI values
      );

      // Formatar resultado
      const resultado = this.formatarResultado(
        resultados,
        dto.investimentoInicial,
        dto.prazoMeses,
        trMensal,
      );

      this.logger.log('Fixed income simulation completed successfully');
      this.logger.debug(`Best investment: ${resultado.melhorInvestimento}`);

      // Adicionar ofertas detalhadas se disponíveis
      if (apiResponse && this.rendaFixaApiClient.hasValidOffers(apiResponse)) {
        try {
          const apiMelhorTitulo = apiResponse.resultados.melhor_titulo;
          const apiMelhorTituloSistema = API_TO_SYSTEM_MAP[apiMelhorTitulo];

          if (apiMelhorTitulo !== 'POUP') {
            const ofertas = apiResponse.resultados.listamelhortitulo;

            if (apiMelhorTitulo === 'SELIC') {
              resultado.ofertasDetalhadas =
                this.transformarOfertasTesouro(ofertas);
            } else {
              resultado.ofertasDetalhadas =
                this.transformarOfertasInvestimento(ofertas);
            }
            resultado.tipoOfertasDetalhadas =
              apiMelhorTituloSistema || apiMelhorTitulo;
          }
        } catch (error) {
          this.logger.warn('Failed to process detailed offers', error.message);
        }
      }

      // Salvar simulação no banco
      await this.salvarSimulacao(dto, resultado);

      return resultado;
    } catch (error) {
      this.logger.error('Error in fixed income simulation', error.stack);
      throw error;
    }
  }

  /**
   * Transforma ofertas de CDB/LCI para DTO
   */
  private transformarOfertasInvestimento(
    ofertas: OfertaInvestimento[],
  ): InvestimentoOfertaDto[] {
    return ofertas.map((oferta) => ({
      corretora: oferta.corretora,
      emissor: oferta.emissor,
      taxa: oferta.taxa,
      vencimento: oferta.vencimento,
      qtdMinima: oferta.qtdMinima,
      vl: oferta.vl,
    }));
  }

  /**
   * Transforma ofertas de Tesouro Direto/SELIC para DTO
   */
  private transformarOfertasTesouro(
    ofertas: OfertaTesouro[],
  ): OfertaTesouroDto[] {
    return ofertas.map((oferta) => ({
      nom: oferta.nom,
      tipo: oferta.tipo,
      tx: oferta.tx,
      data_vencto: oferta.data_vencto,
      vlr: oferta.vlr,
    }));
  }

  /**
   * Formata os resultados dos cálculos para o DTO de resposta
   */
  private formatarResultado(
    calculos: InvestimentosRendaFixa,
    investimentoInicial: number,
    prazoMeses: number,
    trMensal: number,
  ): ResultadoRendaFixaDto {
    const totalInvestido = investimentoInicial;

    return {
      poupanca: this.formatarModalidade(
        calculos.poupanca,
        totalInvestido,
        prazoMeses,
      ),
      tesouroDireto: this.formatarModalidade(
        calculos.tesouroDireto,
        totalInvestido,
        prazoMeses,
      ),
      lci: this.formatarModalidade(calculos.lci, totalInvestido, prazoMeses),
      cdb: this.formatarModalidade(calculos.cdb, totalInvestido, prazoMeses),
      melhorInvestimento: calculos.melhorInvestimento,
      melhorRendimento: this.arredondar(calculos.melhorRendimento),
      totalInvestido: this.arredondar(totalInvestido),
      taxaSelic: this.arredondar(calculos.taxaSelic),
      taxaCdi: this.arredondar(calculos.taxaCdi),
      taxaTr: this.arredondar(trMensal),
    };
  }

  /**
   * Formata uma modalidade específica de investimento
   */
  private formatarModalidade(
    modalidade: {
      taxa: Decimal;
      resultado: Decimal;
      imposto: Decimal;
    },
    totalInvestido: number,
    prazoMeses: number,
  ): ResultadoModalidadeDto {
    const resultado = this.arredondar(modalidade.resultado);
    const rendimentoLiquido = resultado - totalInvestido;
    const percentualRendimento =
      totalInvestido > 0 ? (rendimentoLiquido / totalInvestido) * 100 : 0;

    // Calcular rendimento mensal usando média geométrica (conforme legacy)
    // Fórmula: ((resultado/investido)^(1/meses) - 1) * 100
    const percentualRendimentoMensal = new Decimal(resultado)
      .div(totalInvestido)
      .pow(new Decimal(1).div(prazoMeses))
      .minus(1)
      .mul(100);

    // Calcular rendimento anual a partir da taxa mensal
    // Fórmula: ((1 + taxa_mensal)^12 - 1) * 100
    const taxaMensalDecimal = modalidade.taxa; // já em decimal
    const percentualRendimentoAnual = new Decimal(1)
      .plus(taxaMensalDecimal)
      .pow(12)
      .minus(1)
      .mul(100);

    return {
      taxa: this.arredondar(modalidade.taxa),
      resultado,
      imposto: this.arredondar(modalidade.imposto),
      rendimentoLiquido: this.arredondar(rendimentoLiquido),
      percentualRendimento: this.arredondar(percentualRendimento),
      percentualRendimentoMensal: this.arredondar(percentualRendimentoMensal),
      percentualRendimentoAnual: this.arredondar(percentualRendimentoAnual),
    };
  }

  /**
   * Arredonda valores para 2 casas decimais
   */
  private arredondar(valor: number | Decimal): number {
    return new Decimal(valor).toDecimalPlaces(2).toNumber();
  }

  /**
   * Salva a simulação no banco de dados
   */
  private async salvarSimulacao(
    input: SimularRendaFixaDto,
    output: ResultadoRendaFixaDto,
  ): Promise<void> {
    try {
      const simulationData = {
        simulatorType: SimulatorType.RENDA_FIXA,
        inputData: JSON.parse(JSON.stringify(input)),
        outputData: JSON.parse(JSON.stringify(output)),
        nome: input.nome,
        email: input.email,
        email_opt_in_simulation: input.email_opt_in_simulation,
        email_opt_in_content: input.email_opt_in_content || false,
        email_opt_in_at: input.email_opt_in_simulation ? new Date() : null,
      };

      await this.prisma.simulation.create({
        data: simulationData,
      });

      if (input.email_opt_in_simulation) {
        await this.emailService.sendSimulationResult({
          simulationType: SimulatorType.RENDA_FIXA,
          userEmail: input.email,
          userName: input.nome,
          input: simulationData.inputData,
          output: simulationData.outputData,
          summary: `Simulação de Renda Fixa: Melhor opção ${output.melhorInvestimento} com rendimento de R$ ${output.melhorRendimento}`,
          createdAt: new Date(),
        });
      }

      this.logger.log('Fixed income simulation saved to database');
    } catch (error) {
      this.logger.warn(
        'Failed to save fixed income simulation, continuing',
        error?.stack,
      );
      // Don't throw - simulation should still work even if logging fails
    }
  }
}
