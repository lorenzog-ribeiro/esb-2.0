import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SimulatorType } from '@prisma/client';
import { SimularTaxaMaquininhaDto } from './dto/simular-taxa-maquininha.dto';
import {
  ResultadoTaxaMaquininhaDto,
  MaquininhaCalculadaDto,
} from './dto/resultado-taxa-maquininha.dto';
import { calcularMaq } from './calc/taxa-maquininha.calc';
import { MaquininhasDatabaseService } from '../maquininhas-data/maquininhas-database.service';
import { FiltrosMaquininha } from './interfaces/maquininha.interface';
import { EmailService } from '../../email/email.service';

@Injectable()
export class TaxaMaquininhaService {
  private readonly logger = new Logger(TaxaMaquininhaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly maquininhasDb: MaquininhasDatabaseService,
  ) {}

  /**
   * Simula taxas de maquininhas com base nos valores de venda informados
   *
   * Processo migrado do Django calculos.py::calcular_maq:
   * 1. Carrega todas as maquininhas ativas
   * 2. Aplica filtros informados pelo usuário
   * 3. Para cada maquininha/plano:
   *    - Verifica se atende aos critérios (parcelas, segmento, etc.)
   *    - Calcula custo mensal baseado no modelo de cobrança
   *    - Aplica fórmulas de antecipação se necessário
   * 4. Ordena resultados por avaliação (decrescente)
   * 5. Salva simulação no banco
   *
   * @param dto - Dados da simulação
   * @returns Resultado com todas as maquininhas calculadas
   */
  async simular(
    dto: SimularTaxaMaquininhaDto,
  ): Promise<ResultadoTaxaMaquininhaDto> {
    try {
      this.logger.log('Starting card machine fee simulation');
      const redactedDto = { ...dto, email: '***', nome: '***' };
      this.logger.debug(`Input: ${JSON.stringify(redactedDto)}`);

      // Montar filtros a partir do DTO
      const filtros: FiltrosMaquininha | null = this.montarFiltros(dto);

      // Carregar maquininhas do banco (DATABASE_URL via Prisma)
      const maquininhas = await this.maquininhasDb.getMaquininhasAtivas();

      this.logger.debug(
        `Loaded ${maquininhas.length} active card machines from data`,
      );

      // O calc espera valores em CENTAVOS (compatível com Django)
      // Frontend envia em reais (5000 = R$5000)
      const valCredito = Math.round(dto.venda_credito_vista * 100);
      const valDebito = Math.round(dto.venda_debito * 100);
      const valCreditoP = Math.round(dto.venda_credito_parcelado * 100);

      const resultados = calcularMaq(
        valCredito,
        valDebito,
        valCreditoP,
        dto.numero_parcelas,
        dto.segmento || null,
        filtros,
        maquininhas,
      );

      this.logger.log(
        `Calculation completed. Found ${resultados.length} matching machines`,
      );

      // Deriva wifi de tipo_conexoes (Wi-Fi presente na lista)
      const hasWifi = (conexoes: { nome: string }[]) =>
        conexoes?.some((c) => c.nome === 'Wi-Fi') ?? false;

      // Converter para DTOs
      const maquininhasDtos: MaquininhaCalculadaDto[] = resultados.map((r) => ({
        nome: r.nome,
        id_maq: r.id_maq,
        empresa: r.empresa,
        empresa_cnpj: r.empresa_cnpj,
        logo: r.logo,
        imagem_maquina: r.imagem_maquina,
        valor_mensal: r.valor_mensal,
        valor_mensalidade: r.valor_mensalidade,
        valor_transacao: r.valor_transacao,
        valor_selo: r.valor_selo,
        dias_debito: r.dias_debito,
        dias_credito: r.dias_credito,
        tipo_dias_credito: r.tipo_dias_credito,
        dias_credito_parcelado: r.dias_credito_parcelado,
        tipo_recebimento_parcelado: r.tipo_recebimento_parcelado,
        co_cartao: r.co_cartao,
        site: r.site,
        observacao: r.observacao,
        cupom: r.cupom,
        possibilidade_parcelamento: r.possibilidade_parcelamento,
        afiliacao_a_banco: r.afiliacao_a_banco,
        chip: r.chip,
        tarja: r.tarja,
        NFC: r.NFC,
        wifi: hasWifi(r.tipo_conexoes),
        PF: r.PF,
        PJ: r.PJ,
        precisa_de_telefone: r.precisa_de_telefone,
        fio: r.fio,
        imprime_recibo: r.imprime_recibo,
        garantia: r.garantia,
        possivel_antecipacao: r.possivel_antecipacao,
        antecipado: r.antecipado,
        opcao_ecommerce: r.opcao_ecommerce,
        taxas_transparentes: r.taxas_transparentes,
        vale_refeicao: r.vale_refeicao,
        tipo_conexoes: r.tipo_conexoes,
        forma_recebimento: r.forma_recebimento,
        bandeiras: r.bandeiras,
        avaliacao: r.avaliacao,
        data_atualizacao: r.data_atualizacao,
        url_avaliacao: r.url_avaliacao,
        cruzamentos: r.cruzamentos,
        tem_parceria: r.tem_parceria,
      }));

      // Ordenar por custo mensal (menor primeiro) - para exibição
      // No Django ordena por avaliação, mas para usuário final faz mais sentido por custo
      const maquininhasOrdenadas = [...maquininhasDtos].sort(
        (a, b) => a.valor_mensal - b.valor_mensal,
      );

      // Montar resultado
      const resultado: ResultadoTaxaMaquininhaDto = {
        maquininhas: maquininhasOrdenadas,
        total: maquininhasOrdenadas.length,
        melhor_opcao: maquininhasOrdenadas[0], // Menor custo
        input_data: {
          venda_debito: dto.venda_debito,
          venda_credito_vista: dto.venda_credito_vista,
          venda_credito_parcelado: dto.venda_credito_parcelado,
          numero_parcelas: dto.numero_parcelas,
          segmento: dto.segmento,
        },
      };

      // Salvar simulação no banco
      await this.salvarSimulacao(dto, resultado);

      this.logger.log(
        `Simulation completed successfully. Best option: ${resultado.melhor_opcao.nome} (R$ ${resultado.melhor_opcao.valor_mensal.toFixed(2)}/mês)`,
      );

      return resultado;
    } catch (error) {
      this.logger.error('Error in card machine simulation', error.stack);
      throw error;
    }
  }

  /**
   * Monta objeto de filtros a partir do DTO
   * Migrado da estrutura do Django models.Simulacao
   */
  private montarFiltros(
    dto: SimularTaxaMaquininhaDto,
  ): FiltrosMaquininha | null {
    // Se nenhum filtro foi informado, retorna null
    const temFiltros =
      dto.sem_mensalidade ||
      dto.aceita_cartao_tarja ||
      dto.sem_fio ||
      dto.pf ||
      dto.pj ||
      dto.imprime_recibo ||
      dto.wifi ||
      dto.quer_antecipar ||
      dto.n_exige_smartphone ||
      dto.aceita_vale_refeicao ||
      dto.ecommerce;

    if (!temFiltros) {
      return null;
    }

    return {
      mensalidade: dto.sem_mensalidade || false,
      tarja: dto.aceita_cartao_tarja || false,
      fio: dto.sem_fio || false,
      PF: dto.pf || false,
      PJ: dto.pj || false,
      imprime_recibo: dto.imprime_recibo || false,
      wifi: dto.wifi || false,
      quero_antecipar: dto.quer_antecipar || false,
      precisa_de_telefone: dto.n_exige_smartphone || false,
      vale_refeicao: dto.aceita_vale_refeicao || false,
      opcao_ecommerce: dto.ecommerce || false,
    };
  }

  /**
   * Salva a simulação no banco de dados
   * Migrado do Django - salva para histórico e análise
   */
  private async salvarSimulacao(
    dto: SimularTaxaMaquininhaDto,
    resultado: ResultadoTaxaMaquininhaDto,
  ): Promise<void> {
    try {
      const simulationData = {
        simulatorType: SimulatorType.TAXA_MAQUININHA,
        nome: dto.nome,
        email: dto.email,
        inputData: {
          venda_debito: dto.venda_debito,
          venda_credito_vista: dto.venda_credito_vista,
          venda_credito_parcelado: dto.venda_credito_parcelado,
          numero_parcelas: dto.numero_parcelas,
          segmento: dto.segmento || null,
          // Filtros
          sem_mensalidade: dto.sem_mensalidade || false,
          aceita_cartao_tarja: dto.aceita_cartao_tarja || false,
          sem_fio: dto.sem_fio || false,
          pf: dto.pf || false,
          pj: dto.pj || false,
          imprime_recibo: dto.imprime_recibo || false,
          wifi: dto.wifi || false,
          quer_antecipar: dto.quer_antecipar || false,
          n_exige_smartphone: dto.n_exige_smartphone || false,
          aceita_vale_refeicao: dto.aceita_vale_refeicao || false,
          ecommerce: dto.ecommerce || false,
          // Metadados
          compartilharDados: dto.compartilharDados || true,
          origem: dto.origem || null,
        },
        outputData: {
          total: resultado.total,
          melhor_opcao: {
            nome: resultado.melhor_opcao.nome,
            empresa: resultado.melhor_opcao.empresa,
            valor_mensal: resultado.melhor_opcao.valor_mensal,
            avaliacao: resultado.melhor_opcao.avaliacao,
          },
          // Salva top 10 maquininhas
          top_10: resultado.maquininhas.slice(0, 10).map((m) => ({
            nome: m.nome,
            empresa: m.empresa,
            valor_mensal: m.valor_mensal,
            avaliacao: m.avaliacao,
            dias_debito: m.dias_debito,
            dias_credito: m.dias_credito,
          })),
        },
        email_opt_in_simulation: dto.email_opt_in_simulation,
        email_opt_in_content: dto.email_opt_in_content || false,
        email_opt_in_at: dto.email_opt_in_simulation ? new Date() : null,
      };

      await this.prisma.simulation.create({
        data: simulationData,
      });

      if (dto.email_opt_in_simulation) {
        await this.emailService.sendSimulationResult({
          simulationType: SimulatorType.TAXA_MAQUININHA,
          userEmail: dto.email,
          userName: dto.nome,
          input: simulationData.inputData,
          output: simulationData.outputData,
          summary: `Simulação de Taxa de Maquininha: Melhor opção ${resultado.melhor_opcao.nome} (R$ ${resultado.melhor_opcao.valor_mensal.toFixed(2)}/mês)`,
          createdAt: new Date(),
        });
      }

      this.logger.log(
        `Simulation saved successfully for ${dto.email} (${resultado.total} results)`,
      );
    } catch (error) {
      // Não falhar a simulação se o salvamento falhar
      this.logger.error('Failed to save simulation to database', error.stack);
    }
  }
}
