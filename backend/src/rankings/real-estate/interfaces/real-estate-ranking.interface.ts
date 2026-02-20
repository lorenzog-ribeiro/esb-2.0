/**
 * Interfaces para o Ranking de Imoveis.
 *
 * Mapeadas a partir do modelo Django Ranking_Imovel:
 *   - instituicao (ForeignKey Marca)
 *   - modalidade (ForeignKey Modalidade)
 *   - cet (Decimal)
 *   - prestacao_inicial (Decimal)
 *   - produto_financiamento (ForeignKey ProdutoFinanciamento)
 *
 * Referencia: ESB-Bolsito-Microservices/financiamento/.../models.py (linha 375)
 */

export interface RealEstateEntry {
  id: number;
  instituicao: string;
  logo: string;
  modalidade: string;
  cet: number;
  prestacaoInicial: number;
  linkContratacao: string;
  ativo: boolean;
}

export interface RealEstateRankingResponse {
  data: string;
  resultados: RealEstateRankingItem[];
  total: number;
}

export interface RealEstateRankingItem {
  rank: number;
  instituicao: string;
  logo: string;
  modalidade: string;
  cet: number;
  prestacaoInicial: number;
  linkContratacao: string;
}
