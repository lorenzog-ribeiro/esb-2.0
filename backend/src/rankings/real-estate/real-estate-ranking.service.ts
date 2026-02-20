/**
 * real-estate-ranking.service.ts
 *
 * Servico do Ranking de Imoveis.
 *
 * Equivalente a funcao top_imoveis() do legado Django:
 *   - Carrega entradas ativas do dataset estatico
 *   - Ordena por prestacao_inicial crescente (menor parcela primeiro)
 *   - Aplica limite configuravel
 *
 * Fonte do legado:
 *   ESB-Bolsito-Microservices/financiamento/.../utils.py top_imoveis()
 *
 * Independencia de dados: usa exclusivamente REAL_ESTATE_DATA (data estatico).
 * Nao ha dependencia de OLD_DATABASE_URL ou APIs do legado.
 */

import { Injectable } from '@nestjs/common';
import {
  REAL_ESTATE_DATA,
  REAL_ESTATE_RANKING_LIMIT,
} from './data/real-estate.data';
import { RealEstateRankingRequestDto } from './dto/ranking-request.dto';
import {
  RealEstateRankingItemDto,
  RealEstateRankingResponseDto,
} from './dto/ranking-response.dto';

@Injectable()
export class RealEstateRankingService {
  /**
   * Retorna o ranking de imoveis ordenado por menor prestacao inicial.
   * Equivale a top_imoveis() do legado com ordenacao e limite aplicados.
   *
   * @param request - Filtros opcionais (modalidade, limite)
   * @returns RealEstateRankingResponseDto com itens ranqueados
   */
  getRanking(
    request: RealEstateRankingRequestDto = {},
  ): RealEstateRankingResponseDto {
    const limite = request.limite ?? REAL_ESTATE_RANKING_LIMIT;

    let entradas = REAL_ESTATE_DATA.filter((e) => e.ativo);

    if (request.modalidade) {
      const filtro = request.modalidade.toLowerCase();
      entradas = entradas.filter((e) =>
        e.modalidade.toLowerCase().includes(filtro),
      );
    }

    // Ordena por prestacao_inicial crescente (equivale ao sorted() do legado)
    entradas = [...entradas].sort(
      (a, b) => a.prestacaoInicial - b.prestacaoInicial,
    );

    // Aplica limite
    entradas = entradas.slice(0, limite);

    const resultados: RealEstateRankingItemDto[] = entradas.map(
      (entrada, index) => ({
        rank: index + 1,
        instituicao: entrada.instituicao,
        logo: entrada.logo,
        modalidade: entrada.modalidade,
        cet: entrada.cet,
        prestacaoInicial: entrada.prestacaoInicial,
        linkContratacao: entrada.linkContratacao,
      }),
    );

    return {
      data: new Date().toISOString().split('T')[0],
      resultados,
      total: resultados.length,
    };
  }
}
