import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SimulatorType } from '@prisma/client';
import { CompararMaquininhaDto } from './dto/comparar-maquininha.dto';
import {
  ResultadoComparacaoDto,
  CaracteristicasMaquininhaDto,
} from './dto/resultado-comparacao.dto';
import {
  ListaMaquininhasDto,
  MaquininhaOpcaoDto,
} from './dto/maquininha-opcao.dto';
import { MaquininhasDatabaseService } from '../maquininhas-data/maquininhas-database.service';
import { EmailService } from '../../email/email.service';

@Injectable()
export class ComparadorMaquininhaService {
  private readonly logger = new Logger(ComparadorMaquininhaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly maquininhasDb: MaquininhasDatabaseService,
  ) {}

  /**
   * Retorna lista de maquininhas disponíveis para comparação (do banco de dados)
   *
   * @returns Lista com id, nome, empresa e logo de cada maquininha ativa
   */
  async listarMaquinhasDisponiveis(): Promise<ListaMaquininhasDto> {
    try {
      this.logger.log('Fetching available card machines from database');

      const maquininhasAtivas =
        await this.maquininhasDb.getMaquininhasAtivas();

      const maquininhasOpcoes: MaquininhaOpcaoDto[] = maquininhasAtivas.map(
        (m) => ({
          id: m.id,
          nome: m.nome,
          empresa: m.empresa.nome,
          logo: m.empresa.logo,
        }),
      );

      this.logger.log(
        `Found ${maquininhasOpcoes.length} active card machines available for comparison`,
      );

      return {
        maquininhas: maquininhasOpcoes,
        total: maquininhasOpcoes.length,
      };
    } catch (error) {
      this.logger.error('Error fetching available card machines', error.stack);
      throw error;
    }
  }

  /**
   * Compara características de múltiplas maquininhas lado a lado
   *
   * Versão simplificada focada em comparação de features, sem cálculo de custos
   * Útil para quando o usuário quer comparar especificações técnicas
   * Dados carregados do banco de dados.
   *
   * @param dto - IDs das maquininhas a comparar
   * @returns Características de cada maquininha para comparação
   */
  async comparar(dto: CompararMaquininhaDto): Promise<ResultadoComparacaoDto> {
    try {
      this.logger.log(
        `Starting card machine comparison for ${dto.maquininhas_ids.length} machines`,
      );
      const redactedDto = { ...dto, email: '***', nome: '***' };
      this.logger.debug(`Input: ${JSON.stringify(redactedDto)}`);

      const maquininhasAtivas =
        await this.maquininhasDb.getMaquininhasAtivas();
      const maquininhas = maquininhasAtivas.filter((m) =>
        dto.maquininhas_ids.includes(m.id),
      );

      if (maquininhas.length === 0) {
        throw new NotFoundException(
          'Nenhuma maquininha encontrada com os IDs informados',
        );
      }

      if (maquininhas.length < 2) {
        throw new NotFoundException(
          'É necessário pelo menos 2 maquininhas para comparar',
        );
      }

      this.logger.debug(`Found ${maquininhas.length} card machines to compare`);

      // Converter para DTOs de comparação
      const maquininhasDtos: CaracteristicasMaquininhaDto[] = maquininhas.map(
        (m) => ({
          id: m.id,
          nome: m.nome,
          empresa: m.empresa.nome,
          logo: m.empresa.logo,
          imagem: m.imagem,
          preco: m.valor_leitor,
          preco_promocional: m.valor_promocional,
          mensalidade: m.valor_mensalidade,
          chip: m.chip,
          tarja: m.tarja,
          nfc: m.NFC,
          com_fio: m.fio,
          imprime_recibo: m.imprime_recibo,
          precisa_smartphone: m.precisa_de_telefone,
          permite_antecipacao: m.possivel_antecipacao,
          atende_pf: m.PF,
          atende_pj: m.PJ,
          vale_refeicao: m.vale_refeicao,
          ecommerce: m.opcao_ecommerce,
          max_parcelas: m.possibilidade_parcelamento,
          garantia: m.garantia,
          tipos_conexao: m.tipo_conexao.map((tc) => tc.nome),
          bandeiras: m.bandeiras.map((b) => b.nome),
          formas_recebimento: m.forma_recebimento.map((fr) => fr.nome),
          observacoes: m.observacao,
          url_contratacao: m.planos.length > 0 ? m.planos[0].url : '#',
          cupom: m.cupom,
          transparencia: m.transparencia,
          url_avaliacao: m.url_avaliacao,
          data_atualizacao: m.atualizado_em.toLocaleDateString('pt-BR'),
          planos: m.planos
            .filter((p) => p.ativo)
            .map((p) => ({
              id: p.id,
              nome: p.nome,
              taxa_debito: this.formatarPercentual(p.taxa_desconto_debito),
              taxa_credito_vista: this.formatarPercentual(
                p.taxa_desconto_credito_vista,
              ),
              taxa_credito_parcelado_min: this.formatarPercentual(
                p.taxa_desconto_credito_vista + p.taxa_adicional_parcela,
              ),
              dias_repasse_debito: p.dias_repasse_debito,
              dias_repasse_credito: p.dias_repasse_credito,
              avaliacao: p.avaliacao,
            })),
        }),
      );

      const resultado: ResultadoComparacaoDto = {
        maquininhas: maquininhasDtos,
        total: maquininhasDtos.length,
      };

      // Salvar comparação no banco
      await this.salvarComparacao(dto, resultado);

      this.logger.log(
        `Comparison completed successfully for ${resultado.total} machines`,
      );

      return resultado;
    } catch (error) {
      this.logger.error('Error in card machine comparison', error.stack);
      throw error;
    }
  }

  /**
   * Formata número decimal para percentual
   * Exemplo: 0.0299 => "2,99%"
   */
  private formatarPercentual(valor: number): string {
    return `${(valor * 100).toFixed(2).replace('.', ',')}%`;
  }

  /**
   * Salva a comparação no banco de dados
   */
  private async salvarComparacao(
    dto: CompararMaquininhaDto,
    resultado: ResultadoComparacaoDto,
  ): Promise<void> {
    try {
      const simulationData = {
        simulatorType: SimulatorType.COMPARADOR_MAQUININHA,
        nome: dto.nome,
        email: dto.email,
        inputData: {
          maquininhas_ids: dto.maquininhas_ids,
          compartilharDados: dto.compartilharDados || true,
          origem: dto.origem || null,
        },
        outputData: {
          total: resultado.total,
          maquininhas: resultado.maquininhas.map((m) => ({
            id: m.id,
            nome: m.nome,
            empresa: m.empresa,
            preco: m.preco,
            mensalidade: m.mensalidade,
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
          simulationType: SimulatorType.COMPARADOR_MAQUININHA,
          userEmail: dto.email,
          userName: dto.nome,
          input: simulationData.inputData,
          output: simulationData.outputData,
          summary: `Comparação de ${resultado.total} maquininhas`,
          createdAt: new Date(),
        });
      }

      this.logger.log(
        `Comparison saved successfully for ${dto.email} (${resultado.total} machines)`,
      );
    } catch (error) {
      // Não falhar a comparação se o salvamento falhar
      this.logger.error('Failed to save comparison to database', error.stack);
    }
  }
}
