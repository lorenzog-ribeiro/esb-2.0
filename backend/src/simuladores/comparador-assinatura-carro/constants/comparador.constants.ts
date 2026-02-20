/**
 * comparador.constants.ts
 *
 * Constants for car subscription comparator
 * Imported from legacy system - DO NOT MODIFY without approval
 */

/**
 * Taxas e custos anuais de propriedade de veículo
 */
export const TAXAS_ANUAIS = {
  /**
   * Manutenção anual como percentual do valor do veículo
   * Exemplo: 1% de R$ 80.000 = R$ 800/ano
   */
  MANUTENCAO_PERCENT: 1.0,

  /**
   * IPVA (Imposto sobre Propriedade de Veículos Automotores) anual
   * Percentual sobre o valor do veículo
   */
  IPVA_PERCENT: 4.0,

  /**
   * Seguro anual como percentual do valor do veículo
   */
  SEGURO_PERCENT: 4.0,

  /**
   * Custo de emplacamento (taxa única anual)
   */
  EMPLACAMENTO_CUSTO: 170.0,

  /**
   * Custo de licenciamento anual
   */
  LICENCIAMENTO_CUSTO: 160.0,
} as const;

/**
 * Taxas de financiamento
 */
export const TAXAS_FINANCIAMENTO = {
  /**
   * Taxa de juros mensal para financiamento (sistema PRICE)
   * 2.5% ao mês
   */
  TAXA_MENSAL_PERCENT: 2.5,
} as const;

/**
 * Ajustes de assinatura
 */
export const AJUSTES_ASSINATURA = {
  /**
   * Reajuste anual do valor da assinatura
   * Baseado em inflação histórica + margem
   */
  REAJUSTE_ANUAL_PERCENT: 5.0,
} as const;

/**
 * Curva de depreciação por ano (percentual do valor original)
 * Ano 1: 20%, Ano 2: 25%, Ano 3: 30%, Ano 4: 35%, Ano 5: 39%
 *
 * Exemplo:
 * Veículo de R$ 80.000
 * - Após 1 ano: Vale R$ 64.000 (perdeu 20%)
 * - Após 2 anos: Vale R$ 60.000 (perdeu 25% do original)
 * - Após 3 anos: Vale R$ 56.000 (perdeu 30% do original)
 */
export const CURVA_DEPRECIACAO_PERCENT = [
  20.0, 25.0, 30.0, 35.0, 39.0,
] as const;

/**
 * URLs de redirecionamento (links educacionais)
 */
export const URLS_REDIRECIONAMENTO = {
  /**
   * URL para página de assinatura de veículos (Localiza Meoo)
   */
  ASSINATURA_URL:
    'https://educandoseubolso.blog.br/externo/localiza-meoo-comparador/',

  /**
   * URL para o Simulador de Financiamento de Veículos (interno)
   */
  FINANCIAMENTO_URL: '/simuladores/financiamento-veiculos',
} as const;

/**
 * Calcula custos fixos anuais de propriedade (emplacamento + licenciamento)
 * @returns Custo fixo anual total
 */
export function calcularCustosFixosAnuais(): number {
  return TAXAS_ANUAIS.EMPLACAMENTO_CUSTO + TAXAS_ANUAIS.LICENCIAMENTO_CUSTO;
}

/**
 * Obtém percentual de depreciação para um ano específico
 * @param ano - Ano (1-5)
 * @returns Percentual de depreciação acumulada
 */
export function obterDepreciacaoAno(ano: number): number {
  if (ano < 1 || ano > 5) {
    throw new Error('Year must be between 1 and 5');
  }
  return CURVA_DEPRECIACAO_PERCENT[ano - 1];
}
