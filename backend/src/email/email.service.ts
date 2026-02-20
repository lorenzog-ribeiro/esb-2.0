/**
 * email.service.ts
 *
 * Servico de email do ESB 2.0.
 *
 * Responsabilidades:
 *   - Receber o payload de simulacao
 *   - Buscar Posts Relacionados via ContentService (sem URLs hardcoded)
 *   - Montar o HTML final usando o Master Template (simulation-result.template.ts)
 *   - Delegar o envio ao provider configurado (Resend)
 *
 * O ContentService injeta dinamicamente artigos do WordPress/Strapi
 * no rodape do email, removendo a dependencia de URLs fixas do legado.
 */

import { Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { EMAIL_PROVIDER, EmailProvider } from './interfaces/email-provider.interface';
import { SimulationEmailPayload } from './dto/simulation-email-payload.dto';
import { generateSimulationEmail } from './templates/simulation-result.template';
import { ContentService } from '../content/content.service';
import { RelatedPost } from './templates/partials/email-footer.partial';

/**
 * Mapa de categoria do blog por tipo de simulador.
 * Permite buscar posts relacionados contextualmente.
 * Sem URLs hardcoded: apenas slugs/IDs de categoria.
 */
const SIMULATOR_CATEGORY_MAP: Record<string, string> = {
  AMORTIZACAO: 'financiamento-imobiliario',
  FINANCIAMENTO_IMOVEL: 'financiamento-imobiliario',
  FINANCIAMENTO_VEICULOS: 'financiamento-veiculos',
  EMPRESTIMO: 'emprestimo-pessoal',
  APOSENTADORIA: 'aposentadoria',
  RENDA_FIXA: 'investimentos',
  INVESTIMENTOS: 'investimentos',
  JUROS_COMPOSTOS: 'educacao-financeira',
  TAXA_MAQUININHA: 'maquininha-de-cartao',
  COMPARADOR_MAQUININHA: 'maquininha-de-cartao',
  COMBUSTIVEL: 'carro',
  COMPARADOR_ASSINATURA_CARRO: 'carro',
  CONTAS_DIGITAIS: 'contas-digitais',
};

const MAX_RELATED_POSTS = 3;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
    @Optional()
    private readonly contentService: ContentService | null,
  ) {}

  /**
   * Envia o email de resultado de simulacao com posts relacionados no rodape.
   *
   * @param payload - Dados da simulacao (tipo, usuario, input, output, resumo)
   */
  async sendSimulationResult(payload: SimulationEmailPayload): Promise<void> {
    const maskedEmail = payload.userEmail.replace(/(.{1,2})(.*)(@.*)/, '$1***$3');
    this.logger.log(`Preparando email de resultado para ${maskedEmail}`);

    try {
      const relatedPosts = await this.fetchRelatedPosts(payload.simulationType);
      const html = generateSimulationEmail(payload, relatedPosts);
      const subject = this.buildSubject(payload.simulationType);

      await this.emailProvider.sendEmail(payload.userEmail, subject, html);

      this.logger.log(`Email de resultado enviado com sucesso para ${maskedEmail}`);
    } catch (error) {
      this.logger.error(
        `Falha ao enviar email de resultado para ${maskedEmail}`,
        error?.stack,
      );
      // Nao propagamos o erro para nao interromper a experiencia do usuario
    }
  }

  /**
   * Busca posts relacionados ao tipo de simulador via ContentService.
   * Retorna array vazio em caso de falha (graceful degradation).
   *
   * @param simulationType - Tipo do simulador (ex: 'AMORTIZACAO')
   * @returns Lista de posts para o rodape do email
   */
  private async fetchRelatedPosts(simulationType: string): Promise<RelatedPost[]> {
    if (!this.contentService) {
      return [];
    }

    try {
      const categorySlug = SIMULATOR_CATEGORY_MAP[simulationType];
      if (!categorySlug) {
        return [];
      }

      const posts = await this.contentService.getPostsByCategory(
        categorySlug,
        MAX_RELATED_POSTS,
      );

      return posts.slice(0, MAX_RELATED_POSTS).map((post) => ({
        title: post.title?.rendered ?? String(post.title ?? ''),
        url: post.link ?? '',
        excerpt: this.stripHtml(post.excerpt?.rendered ?? String(post.excerpt ?? '')),
      }));
    } catch (error) {
      this.logger.warn(
        `Nao foi possivel buscar posts relacionados para ${simulationType}: ${error?.message}`,
      );
      return [];
    }
  }

  /**
   * Gera o assunto do email conforme o tipo de simulador.
   *
   * @param simulationType - Tipo do simulador
   * @returns String com o assunto do email
   */
  private buildSubject(simulationType: string): string {
    const nomeSimulador = simulationType.replace(/_/g, ' ').toLowerCase();
    return `Educando Seu Bolso — Resultado: ${nomeSimulador}`;
  }

  /**
   * Remove tags HTML de um texto (para exibicao do excerpt nos posts).
   *
   * @param html - String com possivel conteudo HTML
   * @returns Texto limpo sem tags
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }
}
