/**
 * financiamento-veiculos.calc.ts
 *
 * Logica de calculo do simulador de financiamento de veiculos.
 * Usa sistema PRICE (Tabela Price / Sistema Frances de Amortizacao).
 *
 * Formulas compartilhadas importadas de shared/math/taxas.util.ts (DRY).
 * Paridade com o legado Python validada em taxas.util.spec.ts.
 */

import Decimal from 'decimal.js';
import {
  converterTaxaAnualParaMensal,
  converterTaxaMensalParaAnual,
  calcularParcelaPRICE,
  calcularTotalPagoPRICE,
  calcularComprometimentoRenda,
  arredondar2Decimais,
  arredondar4Decimais,
} from '../../../shared/math/taxas.util';

// Re-exporta para consumo direto pelos testes
export {
  converterTaxaAnualParaMensal,
  converterTaxaMensalParaAnual,
  calcularParcelaPRICE,
  arredondar2Decimais,
  arredondar4Decimais,
};

/**
 * Calcula o IOF (Imposto sobre Operacoes Financeiras) para financiamento de veiculos.
 *
 * Regras do IOF (2024):
 *   - Aliquota diaria: 0,000082 por dia
 *   - Aliquota adicional: 0,38%
 *   - Limitado a 365 dias
 *
 * Formula:
 *   IOF = Valor Financiado * [(0,000082 * dias) + 0,0038]
 *
 * @param valorFinanciado - Valor a ser financiado
 * @param periodos        - Numero de parcelas (meses)
 * @returns Decimal com o valor do IOF
 */
export function calcularIOF(
  valorFinanciado: number,
  periodos: number,
): Decimal {
  const valor = new Decimal(valorFinanciado);
  const dias = Math.min(periodos * 30, 365);
  const aliquotaDiaria = new Decimal(0.000082);
  const aliquotaAdicional = new Decimal(0.0038);
  const aliquotaTotal = aliquotaDiaria.times(dias).plus(aliquotaAdicional);
  return valor.times(aliquotaTotal);
}

/**
 * Interface para resultado do calculo de financiamento de veiculos.
 */
export interface CalculoFinanciamentoVeiculos {
  parcelaMensal: number;
  valorTotal: number;
  valorIOF: number;
  taxaJurosMensal: number;
  taxaJurosAnual: number;
  comprometimentoRenda: number;
}

/**
 * Calcula todos os valores de um financiamento de veiculos usando sistema PRICE.
 *
 * @param valorFinanciado - Valor a ser financiado (veiculo - entrada)
 * @param prazoMeses      - Prazo em meses
 * @param taxaJurosAnual  - Taxa de juros anual em percentual
 * @param rendaMensal     - Renda mensal do solicitante
 * @returns Objeto com todos os valores calculados
 */
export function calcularFinanciamentoPRICE(
  valorFinanciado: number,
  prazoMeses: number,
  taxaJurosAnual: number,
  rendaMensal: number,
): CalculoFinanciamentoVeiculos {
  const taxaMensalDecimal = converterTaxaAnualParaMensal(taxaJurosAnual);
  const taxaJurosMensal = arredondar4Decimais(taxaMensalDecimal);

  const iofDecimal = calcularIOF(valorFinanciado, prazoMeses);
  const valorIOF = arredondar2Decimais(iofDecimal);

  const valorFinanciadoComIOF = valorFinanciado + valorIOF;

  const parcelaDecimal = calcularParcelaPRICE(
    valorFinanciadoComIOF,
    prazoMeses,
    taxaJurosMensal,
  );
  const parcelaMensal = arredondar2Decimais(parcelaDecimal);

  const totalPagoDecimal = calcularTotalPagoPRICE(parcelaMensal, prazoMeses);
  const valorTotal = arredondar2Decimais(totalPagoDecimal);

  const comprometimentoDecimal = calcularComprometimentoRenda(
    parcelaMensal,
    rendaMensal,
  );
  const comprometimentoRenda = arredondar2Decimais(comprometimentoDecimal);

  return {
    parcelaMensal,
    valorTotal,
    valorIOF,
    taxaJurosMensal,
    taxaJurosAnual: arredondar4Decimais(new Decimal(taxaJurosAnual)),
    comprometimentoRenda,
  };
}
