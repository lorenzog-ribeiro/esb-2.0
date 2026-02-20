/**
 * DTOs de resposta do Ranking de Imoveis.
 */

export class RealEstateRankingItemDto {
  rank: number;
  instituicao: string;
  logo: string;
  modalidade: string;
  cet: number;
  prestacaoInicial: number;
  linkContratacao: string;
}

export class RealEstateRankingResponseDto {
  data: string;
  resultados: RealEstateRankingItemDto[];
  total: number;
}
