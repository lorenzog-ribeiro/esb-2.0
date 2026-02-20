/**
 * shared/math/taxas.util.ts
 *
 * Nucleo financeiro centralizado do ESB 2.0.
 * Todas as formulas de conversao de taxas, calculo de parcelas (PRICE/SAC)
 * e utilitarios de arredondamento residem aqui.
 *
 * Principio DRY: qualquer formula que aparece em dois ou mais simuladores
 * deve ser importada deste modulo. Nao duplicar estas implementacoes nos calc/
 * de cada simulador.
 *
 * Paridade com legado:
 *   Python: decimal.getcontext().prec = 15
 *   NestJS: Decimal.set({ precision: 15, rounding: Decimal.ROUND_HALF_UP })
 *
 * Tolerancia de apresentacao: <= R$ 0,01 em relacao ao resultado Python.
 *
 * Referencias:
 *   - ESB-Bolsito-Microservices/financiamento/.../calculos.py
 *   - ESB-Bolsito-Microservices/amortizacao/.../calculos.py
 *   - docs/04-PROMPT-AUDITORIA-MIGRACAO-SIMULADORES.md secao 1.3
 */

import Decimal from 'decimal.js';

Decimal.set({ precision: 15, rounding: Decimal.ROUND_HALF_UP });

// ---------------------------------------------------------------------------
// Conversao de Taxas
// ---------------------------------------------------------------------------

/**
 * Converte taxa de juros anual percentual para mensal percentual.
 *
 * Formula equivalente ao legado Python:
 *   taxa_mensal = ((1 + taxa_anual / 100) ** (1/12) - 1) * 100
 *
 * @param taxaAnual - Taxa anual em percentual (ex: 12.0 para 12% a.a.)
 * @returns Taxa mensal em percentual (ex: 0.9489... para 12% a.a.)
 */
export function converterTaxaAnualParaMensal(taxaAnual: number): Decimal {
  const taxa = new Decimal(taxaAnual).div(100);
  const potencia = new Decimal(1).plus(taxa).pow(new Decimal(1).div(12));
  return potencia.minus(1).times(100);
}

/**
 * Converte taxa de juros mensal percentual para anual percentual.
 *
 * Formula:
 *   taxa_anual = ((1 + taxa_mensal / 100) ** 12 - 1) * 100
 *
 * @param taxaMensal - Taxa mensal em percentual (ex: 0.9489 para ~12% a.a.)
 * @returns Taxa anual em percentual
 */
export function converterTaxaMensalParaAnual(taxaMensal: number): Decimal {
  const taxa = new Decimal(taxaMensal).div(100);
  const potencia = new Decimal(1).plus(taxa).pow(12);
  return potencia.minus(1).times(100);
}

// ---------------------------------------------------------------------------
// Sistema PRICE (Tabela Price / Sistema Frances de Amortizacao)
// ---------------------------------------------------------------------------

/**
 * Calcula a parcela mensal fixa pelo sistema PRICE.
 *
 * Formula:
 *   PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
 *
 * Onde:
 *   PV = valor do emprestimo (principal)
 *   i  = taxa mensal em decimal (ex: 0.02 para 2%)
 *   n  = numero de parcelas
 *
 * Caso especial: se i = 0, PMT = PV / n (divisao simples).
 *
 * @param principal   - Valor do emprestimo/financiamento
 * @param periodos    - Numero de parcelas (meses)
 * @param taxaMensal  - Taxa mensal em percentual (ex: 2.5 para 2.5%)
 * @returns Decimal com o valor da parcela mensal
 */
export function calcularParcelaPRICE(
  principal: number,
  periodos: number,
  taxaMensal: number,
): Decimal {
  const pv = new Decimal(principal);
  const n = new Decimal(periodos);
  const i = new Decimal(taxaMensal).div(100);

  if (i.isZero()) {
    return pv.div(n);
  }

  const umMaisI = new Decimal(1).plus(i);
  const potencia = umMaisI.pow(n);
  const numerador = i.times(potencia);
  const denominador = potencia.minus(1);

  return pv.times(numerador.div(denominador));
}

// ---------------------------------------------------------------------------
// Sistema SAC (Sistema de Amortizacao Constante)
// ---------------------------------------------------------------------------

/**
 * Calcula a PRIMEIRA parcela (maior) no sistema SAC.
 *
 * No SAC a amortizacao e constante (Principal / n) e os juros incidem
 * sobre o saldo devedor decrescente. A primeira parcela e a maior.
 *
 * Formula:
 *   Parcela_1 = (P / n) + (P * i)
 *
 * @param principal  - Valor financiado
 * @param periodos   - Numero de parcelas (meses)
 * @param taxaMensal - Taxa mensal em percentual
 * @returns Decimal com a primeira parcela
 */
export function calcularPrimeiraParcelaSAC(
  principal: number,
  periodos: number,
  taxaMensal: number,
): Decimal {
  const valor = new Decimal(principal);
  const prazo = new Decimal(periodos);
  const i = new Decimal(taxaMensal).div(100);

  const amortizacao = valor.div(prazo);
  const jurosInicial = valor.times(i);
  return amortizacao.plus(jurosInicial);
}

/**
 * Calcula a ULTIMA parcela (menor) no sistema SAC.
 *
 * Formula:
 *   Parcela_n = (P / n) + ((P / n) * i)
 *   Simplificando: Parcela_n = (P / n) * (1 + i)
 *
 * @param principal  - Valor financiado
 * @param periodos   - Numero de parcelas (meses)
 * @param taxaMensal - Taxa mensal em percentual
 * @returns Decimal com a ultima parcela
 */
export function calcularUltimaParcelaSAC(
  principal: number,
  periodos: number,
  taxaMensal: number,
): Decimal {
  const valor = new Decimal(principal);
  const prazo = new Decimal(periodos);
  const i = new Decimal(taxaMensal).div(100);

  const amortizacao = valor.div(prazo);
  const jurosFinal = amortizacao.times(i);
  return amortizacao.plus(jurosFinal);
}

/**
 * Calcula o total pago no sistema SAC usando a formula da progressao aritmetica.
 *
 * Formula:
 *   Juros_totais = (P * i * (n + 1)) / 2
 *   Total = P + Juros_totais
 *
 * @param principal  - Valor financiado
 * @param periodos   - Numero de parcelas
 * @param taxaMensal - Taxa mensal em percentual
 * @returns Decimal com o total pago
 */
export function calcularTotalPagoSAC(
  principal: number,
  periodos: number,
  taxaMensal: number,
): Decimal {
  const valor = new Decimal(principal);
  const prazo = new Decimal(periodos);
  const i = new Decimal(taxaMensal).div(100);

  const jurosTotais = valor.times(i).times(prazo.plus(1)).div(2);
  return valor.plus(jurosTotais);
}

// ---------------------------------------------------------------------------
// Utilitarios Financeiros Comuns
// ---------------------------------------------------------------------------

/**
 * Calcula o total pago em um financiamento PRICE (parcela fixa x periodos).
 *
 * @param parcelaMensal - Valor da parcela mensal
 * @param periodos      - Numero de parcelas
 * @returns Decimal com o total pago
 */
export function calcularTotalPagoPRICE(
  parcelaMensal: number,
  periodos: number,
): Decimal {
  return new Decimal(parcelaMensal).times(periodos);
}

/**
 * Calcula o total de juros pagos ao longo do financiamento.
 *
 * @param totalPago        - Total efetivamente pago
 * @param valorEmprestimo  - Principal (valor original do emprestimo)
 * @returns Decimal com o total de juros pagos
 */
export function calcularTotalJuros(
  totalPago: number,
  valorEmprestimo: number,
): Decimal {
  return new Decimal(totalPago).minus(valorEmprestimo);
}

/**
 * Calcula o comprometimento percentual de renda com uma parcela.
 *
 * @param parcela - Valor da parcela mensal
 * @param renda   - Renda mensal do solicitante
 * @returns Decimal com o percentual de comprometimento (0 se renda = 0)
 */
export function calcularComprometimentoRenda(
  parcela: number,
  renda: number,
): Decimal {
  if (renda === 0) return new Decimal(0);
  return new Decimal(parcela).div(renda).times(100);
}

// ---------------------------------------------------------------------------
// Arredondadores
// ---------------------------------------------------------------------------

/**
 * Arredonda um Decimal para 2 casas decimais (valores monetarios).
 *
 * @param valor - Decimal a arredondar
 * @returns number com 2 casas decimais
 */
export function arredondar2Decimais(valor: Decimal): number {
  return valor.toDecimalPlaces(2).toNumber();
}

/**
 * Arredonda um Decimal para 4 casas decimais (taxas de juros).
 *
 * @param valor - Decimal a arredondar
 * @returns number com 4 casas decimais
 */
export function arredondar4Decimais(valor: Decimal): number {
  return valor.toDecimalPlaces(4).toNumber();
}

/**
 * Arredonda um valor numerico bruto para 2 casas decimais.
 * Atalho para arredondar2Decimais(new Decimal(valor)).
 *
 * @param valor - Numero a arredondar
 * @returns number com 2 casas decimais
 */
export function roundMoney(valor: number): number {
  return arredondar2Decimais(new Decimal(valor));
}
