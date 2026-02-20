/**
 * financiamento-imovel.calc.ts
 *
 * Logica de calculo do simulador de financiamento imobiliario.
 * Usa sistema SAC (Sistema de Amortizacao Constante).
 *
 * Formulas compartilhadas importadas de shared/math/taxas.util.ts (DRY).
 * Paridade com o legado Python validada em taxas.util.spec.ts.
 */

import Decimal from 'decimal.js';
import {
  converterTaxaAnualParaMensal,
  calcularPrimeiraParcelaSAC,
  calcularUltimaParcelaSAC,
  calcularTotalPagoSAC,
  calcularComprometimentoRenda,
  arredondar2Decimais,
  arredondar4Decimais,
} from '../../../shared/math/taxas.util';

// Re-exporta para consumo direto pelos testes
export {
  converterTaxaAnualParaMensal,
  calcularPrimeiraParcelaSAC,
  calcularUltimaParcelaSAC,
  calcularTotalPagoSAC,
  arredondar2Decimais,
  arredondar4Decimais,
};

/**
 * Interface para resultado do calculo de financiamento imobiliario.
 */
export interface CalculoFinanciamentoImovel {
  parcelaInicial: number;
  parcelaFinal: number;
  valorTotal: number;
  taxaJurosMensal: number;
  taxaJurosAnual: number;
  comprometimentoRenda: number;
}

/**
 * Calcula todos os valores de um financiamento imobiliario usando sistema SAC.
 *
 * @param valorFinanciado - Valor a ser financiado (imovel - entrada)
 * @param prazoMeses      - Prazo em meses
 * @param taxaJurosAnual  - Taxa de juros anual em percentual
 * @param rendaMensal     - Renda mensal do solicitante
 * @returns Objeto com todos os valores calculados
 */
export function calcularFinanciamentoSAC(
  valorFinanciado: number,
  prazoMeses: number,
  taxaJurosAnual: number,
  rendaMensal: number,
): CalculoFinanciamentoImovel {
  const taxaMensalDecimal = converterTaxaAnualParaMensal(taxaJurosAnual);
  const taxaJurosMensal = arredondar4Decimais(taxaMensalDecimal);

  const primeiraParcelaDecimal = calcularPrimeiraParcelaSAC(
    valorFinanciado,
    prazoMeses,
    taxaJurosMensal,
  );
  const parcelaInicial = arredondar2Decimais(primeiraParcelaDecimal);

  const ultimaParcelaDecimal = calcularUltimaParcelaSAC(
    valorFinanciado,
    prazoMeses,
    taxaJurosMensal,
  );
  const parcelaFinal = arredondar2Decimais(ultimaParcelaDecimal);

  const totalPagoDecimal = calcularTotalPagoSAC(
    valorFinanciado,
    prazoMeses,
    taxaJurosMensal,
  );
  const valorTotal = arredondar2Decimais(totalPagoDecimal);

  const comprometimentoDecimal = calcularComprometimentoRenda(
    parcelaInicial,
    rendaMensal,
  );
  const comprometimentoRenda = arredondar2Decimais(comprometimentoDecimal);

  return {
    parcelaInicial,
    parcelaFinal,
    valorTotal,
    taxaJurosMensal,
    taxaJurosAnual: arredondar4Decimais(new Decimal(taxaJurosAnual)),
    comprometimentoRenda,
  };
}
