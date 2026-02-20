/**
 * emprestimo.calc.ts
 *
 * Logica de calculo do simulador de emprestimo pessoal.
 * Formulas de parcelamento e conversao de taxas sao importadas do
 * modulo centralizado shared/math/taxas.util.ts (principio DRY).
 *
 * Paridade com o legado Python (calculos.py) validada em
 * shared/math/taxas.util.spec.ts com tolerancia <= R$ 0,01.
 */

import Decimal from 'decimal.js';
import {
  calcularParcelaPRICE,
  converterTaxaAnualParaMensal,
  converterTaxaMensalParaAnual,
  calcularTotalPagoPRICE,
  calcularTotalJuros,
  calcularComprometimentoRenda,
  arredondar2Decimais,
  arredondar4Decimais,
} from '../../../shared/math/taxas.util';

// Re-exporta funcoes compartilhadas para uso direto pelos testes e servicos
export {
  calcularParcelaPRICE,
  converterTaxaAnualParaMensal,
  converterTaxaMensalParaAnual,
  calcularComprometimentoRenda,
  arredondar2Decimais,
  arredondar4Decimais,
};

/**
 * Calcula a parcela mensal usando o sistema PRICE (Sistema Frances de Amortizacao).
 *
 * Delega para shared/math/taxas.util.ts#calcularParcelaPRICE.
 *
 * @param valorEmprestimo - Valor total do emprestimo
 * @param prazoMeses      - Prazo em meses
 * @param taxaJurosMensal - Taxa de juros mensal em percentual (ex: 2.5 para 2.5%)
 * @returns Decimal com o valor da parcela mensal
 */
export function calcularParcelaSAC(
  valorEmprestimo: number,
  prazoMeses: number,
  taxaJurosMensal: number,
): Decimal {
  const valor = new Decimal(valorEmprestimo);
  const prazo = new Decimal(prazoMeses);
  const juros = new Decimal(taxaJurosMensal).div(100);

  const amortizacao = valor.div(prazo);
  const jurosInicial = valor.times(juros);
  return amortizacao.plus(jurosInicial);
}

/**
 * Calcula o total pago ao final do emprestimo.
 *
 * @param parcelaMensal - Valor da parcela mensal
 * @param prazoMeses    - Prazo em meses
 * @returns Decimal com o valor total pago
 */
export function calcularTotalPago(
  parcelaMensal: number,
  prazoMeses: number,
): Decimal {
  return calcularTotalPagoPRICE(parcelaMensal, prazoMeses);
}

/**
 * Calcula a taxa efetiva anual (considerando capitalizacao composta).
 *
 * TEA = ((Montante Final / Principal) ^ (1 / anos)) - 1
 *
 * @param totalPago       - Valor total pago
 * @param valorEmprestimo - Valor original do emprestimo
 * @param prazoMeses      - Prazo em meses
 * @returns Decimal com a taxa efetiva anual em percentual
 */
export function calcularTaxaEfetivaAnual(
  totalPago: number,
  valorEmprestimo: number,
  prazoMeses: number,
): Decimal {
  const montante = new Decimal(totalPago);
  const principal = new Decimal(valorEmprestimo);
  const anos = new Decimal(prazoMeses).div(12);

  const razao = montante.div(principal);
  const expoente = new Decimal(1).div(anos);
  const potencia = razao.pow(expoente);
  return potencia.minus(1).times(100);
}

/**
 * Interface para resultado do calculo de emprestimo.
 */
export interface CalculoEmprestimo {
  parcelaMensal: number;
  totalPago: number;
  totalJuros: number;
  taxaJurosMensal: number;
  taxaJurosAnual: number;
  taxaEfetivaAnual: number;
  valorEmprestimo: number;
  prazoMeses: number;
}

/**
 * Calcula todos os valores de um emprestimo usando sistema PRICE.
 *
 * @param valorEmprestimo  - Valor do emprestimo
 * @param prazoMeses       - Prazo em meses
 * @param taxaJurosMensal  - Taxa de juros mensal em percentual
 * @returns Objeto com todos os valores calculados
 */
export function calcularEmprestimoPRICE(
  valorEmprestimo: number,
  prazoMeses: number,
  taxaJurosMensal: number,
): CalculoEmprestimo {
  const parcelaDecimal = calcularParcelaPRICE(
    valorEmprestimo,
    prazoMeses,
    taxaJurosMensal,
  );
  const parcelaMensal = arredondar2Decimais(parcelaDecimal);

  const totalPagoDecimal = calcularTotalPago(parcelaMensal, prazoMeses);
  const totalPago = arredondar2Decimais(totalPagoDecimal);

  const totalJurosDecimal = calcularTotalJuros(totalPago, valorEmprestimo);
  const totalJuros = arredondar2Decimais(totalJurosDecimal);

  const taxaAnualDecimal = converterTaxaMensalParaAnual(taxaJurosMensal);
  const taxaJurosAnual = arredondar4Decimais(taxaAnualDecimal);

  const taxaEfetivaAnualDecimal = calcularTaxaEfetivaAnual(
    totalPago,
    valorEmprestimo,
    prazoMeses,
  );
  const taxaEfetivaAnual = arredondar4Decimais(taxaEfetivaAnualDecimal);

  return {
    parcelaMensal,
    totalPago,
    totalJuros,
    taxaJurosMensal: arredondar4Decimais(new Decimal(taxaJurosMensal)),
    taxaJurosAnual,
    taxaEfetivaAnual,
    valorEmprestimo,
    prazoMeses,
  };
}

/**
 * Calcula o comprometimento de renda percentual.
 *
 * @param parcelaMensal - Valor da parcela mensal
 * @param rendaMensal   - Renda mensal do solicitante
 * @returns Percentual de comprometimento da renda
 */
export function calcularComprometimentoRendaEmprestimo(
  parcelaMensal: number,
  rendaMensal: number,
): Decimal {
  return calcularComprometimentoRenda(parcelaMensal, rendaMensal);
}
