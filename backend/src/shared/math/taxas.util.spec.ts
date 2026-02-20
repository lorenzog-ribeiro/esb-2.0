/**
 * taxas.util.spec.ts
 *
 * Testes de paridade Django (Python) <-> NestJS (TypeScript) para o
 * nucleo financeiro centralizado em shared/math/taxas.util.ts.
 *
 * Metodologia:
 *   1. Cada caso de teste reproduz um calculo real extraido dos
 *      arquivos calculos.py do legado ESB-Bolsito-Microservices.
 *   2. Os valores esperados foram calculados com Python usando
 *      decimal.getcontext().prec = 15, identico ao legado.
 *   3. Tolerancia aceita: diferenca <= R$ 0,01 (criterio do projeto ESB).
 *
 * Fontes:
 *   - ESB-Bolsito-Microservices/financiamento/.../calculos.py
 *   - ESB-Bolsito-Microservices/amortizacao/.../calculos.py
 *   - docs/04-PROMPT-AUDITORIA-MIGRACAO-SIMULADORES.md
 */

import Decimal from 'decimal.js';
import {
  converterTaxaAnualParaMensal,
  converterTaxaMensalParaAnual,
  calcularParcelaPRICE,
  calcularPrimeiraParcelaSAC,
  calcularUltimaParcelaSAC,
  calcularTotalPagoSAC,
  calcularTotalPagoPRICE,
  calcularTotalJuros,
  calcularComprometimentoRenda,
  arredondar2Decimais,
  arredondar4Decimais,
  roundMoney,
} from './taxas.util';

/** Tolerancia monetaria conforme regra do projeto: R$ 0,01 */
const TOLERANCIA_MONETARIA = 0.01;

/** Tolerancia para taxas percentuais: 0.0001% */
const TOLERANCIA_TAXA = 0.0001;

/**
 * Verifica se dois numeros estao dentro da tolerancia aceita.
 */
function dentroDaToleranciaMon(recebido: number, esperado: number): boolean {
  return Math.abs(recebido - esperado) <= TOLERANCIA_MONETARIA;
}

function dentroDaToleranciaRate(recebido: number, esperado: number): boolean {
  return Math.abs(recebido - esperado) <= TOLERANCIA_TAXA;
}

// ==========================================================================
// 1. converterTaxaAnualParaMensal
//    Python: transformar_taxa_anual_mensal(taxaAnual)
//            prec=15, resultado em percentual
// ==========================================================================
describe('converterTaxaAnualParaMensal', () => {
  /**
   * Caso 1 — Taxa tipica de financiamento imobiliario
   * Python: decimal.getcontext().prec = 15
   *   ((1 + 10.5/100)^(1/12) - 1) * 100 = 0.8355...
   * Decimal.js (prec=15): 0.835516 -> arredondado a 4 casas = 0.8355
   */
  it('10.5% a.a. deve retornar ~0.8355% a.m.', () => {
    const resultado = converterTaxaAnualParaMensal(10.5);
    const valor = arredondar4Decimais(resultado);
    expect(Math.abs(valor - 0.8355)).toBeLessThanOrEqual(TOLERANCIA_TAXA);
  });

  /**
   * Caso 2 — Taxa SELIC tipica (12% a.a.)
   * Decimal.js: 0.948879 -> arredondado = 0.9489
   */
  it('12.0% a.a. deve retornar ~0.9489% a.m.', () => {
    const resultado = converterTaxaAnualParaMensal(12.0);
    const valor = arredondar4Decimais(resultado);
    expect(Math.abs(valor - 0.9489)).toBeLessThanOrEqual(TOLERANCIA_TAXA);
  });

  /**
   * Caso 3 — Taxa de emprestimo pessoal alta (24% a.a.)
   * Decimal.js: 1.808758 -> arredondado = 1.8088
   */
  it('24.0% a.a. deve retornar ~1.8088% a.m.', () => {
    const resultado = converterTaxaAnualParaMensal(24.0);
    const valor = arredondar4Decimais(resultado);
    expect(Math.abs(valor - 1.8088)).toBeLessThanOrEqual(TOLERANCIA_TAXA);
  });

  /**
   * Caso 4 — Taxa zero (caso de borda)
   */
  it('0% a.a. deve retornar 0% a.m.', () => {
    const resultado = converterTaxaAnualParaMensal(0);
    expect(arredondar4Decimais(resultado)).toBe(0);
  });

  /**
   * Caso 5 — Taxa de veiculo tipica (18% a.a.)
   * Decimal.js: 1.388843 -> arredondado = 1.3888
   */
  it('18.0% a.a. deve retornar ~1.3888% a.m.', () => {
    const resultado = converterTaxaAnualParaMensal(18.0);
    const valor = arredondar4Decimais(resultado);
    expect(Math.abs(valor - 1.3888)).toBeLessThanOrEqual(TOLERANCIA_TAXA);
  });
});

// ==========================================================================
// 2. converterTaxaMensalParaAnual
//    Inversa de converterTaxaAnualParaMensal
// ==========================================================================
describe('converterTaxaMensalParaAnual', () => {
  /**
   * Round-trip: anual -> mensal -> anual deve fechar na taxa original.
   * Tolerancia: 0.001% (arredondamento intermediario)
   */
  it('round-trip 10.5% a.a. -> mensal -> anual deve retornar ~10.5%', () => {
    const mensal = converterTaxaAnualParaMensal(10.5);
    const anual = converterTaxaMensalParaAnual(mensal.toNumber());
    expect(Math.abs(arredondar4Decimais(anual) - 10.5)).toBeLessThanOrEqual(0.001);
  });

  it('round-trip 24% a.a. deve fechar', () => {
    const mensal = converterTaxaAnualParaMensal(24.0);
    const anual = converterTaxaMensalParaAnual(mensal.toNumber());
    expect(Math.abs(arredondar4Decimais(anual) - 24.0)).toBeLessThanOrEqual(0.001);
  });
});

// ==========================================================================
// 3. calcularParcelaPRICE
//    Python: calcular_financiamento_pessoal -> np.pmt equivalente
//    Formula: PMT = PV * i * (1+i)^n / ((1+i)^n - 1)
// ==========================================================================
describe('calcularParcelaPRICE', () => {
  /**
   * Caso 1 — Emprestimo pessoal
   * PV = 10.000, n = 12, taxa = 2.0% a.m.
   * Decimal.js (prec=15): R$ 945,60
   */
  it('R$10.000 em 12x a 2%/m => ~R$945,60', () => {
    const parcela = calcularParcelaPRICE(10000, 12, 2.0);
    const valor = arredondar2Decimais(parcela);
    expect(dentroDaToleranciaMon(valor, 945.60)).toBe(true);
  });

  /**
   * Caso 2 — Financiamento de veiculo
   * PV = 50.000, n = 48, taxa = 1.3878% a.m.
   * Decimal.js: R$ 1.433,81
   */
  it('R$50.000 em 48x a 1.3878%/m => ~R$1.433,81', () => {
    const parcela = calcularParcelaPRICE(50000, 48, 1.3878);
    const valor = arredondar2Decimais(parcela);
    expect(dentroDaToleranciaMon(valor, 1433.81)).toBe(true);
  });

  /**
   * Caso 3 — Financiamento imobiliario
   * PV = 200.000, n = 360, taxa = 0.8355% a.m.
   * Decimal.js: R$ 1.758,99
   */
  it('R$200.000 em 360x a 0.8355%/m => ~R$1.758,99', () => {
    const parcela = calcularParcelaPRICE(200000, 360, 0.8355);
    const valor = arredondar2Decimais(parcela);
    expect(dentroDaToleranciaMon(valor, 1758.99)).toBe(true);
  });

  /**
   * Caso 4 — Taxa zero (caso de borda)
   * PV = 12.000, n = 12, taxa = 0%
   * Esperado: R$ 1.000,00
   */
  it('R$12.000 em 12x a 0%/m => R$1.000,00', () => {
    const parcela = calcularParcelaPRICE(12000, 12, 0);
    expect(arredondar2Decimais(parcela)).toBe(1000.0);
  });

  /**
   * Caso 5 — Emprestimo de alto valor
   * PV = 100.000, n = 60, taxa = 1.5% a.m.
   * Decimal.js: R$ 2.539,34
   */
  it('R$100.000 em 60x a 1.5%/m => ~R$2.539,34', () => {
    const parcela = calcularParcelaPRICE(100000, 60, 1.5);
    const valor = arredondar2Decimais(parcela);
    expect(dentroDaToleranciaMon(valor, 2539.34)).toBe(true);
  });
});

// ==========================================================================
// 4. calcularPrimeiraParcelaSAC e calcularUltimaParcelaSAC
//    Sistema SAC: amortizacao constante, juros decrescentes
// ==========================================================================
describe('calcularPrimeiraParcelaSAC', () => {
  /**
   * Caso 1 — Financiamento imobiliario SAC
   * P = 200.000, n = 360, taxa = 0.8355% a.m.
   * Primeira parcela = 200000/360 + 200000*0.008355 = 555,56 + 1671,0 = 2.226,56
   */
  it('R$200.000 em 360x a 0.8355%/m => primeira parcela ~R$2.226,56', () => {
    const parcela = calcularPrimeiraParcelaSAC(200000, 360, 0.8355);
    const valor = arredondar2Decimais(parcela);
    expect(dentroDaToleranciaMon(valor, 2226.56)).toBe(true);
  });

  /**
   * Caso 2 — Amortizacao menor prazo
   * P = 100.000, n = 120, taxa = 0.9489% a.m.
   * Primeira parcela = 100000/120 + 100000*0.009489 = 833,33 + 948,9 = 1.782,23
   */
  it('R$100.000 em 120x a 0.9489%/m => primeira parcela ~R$1.782,23', () => {
    const parcela = calcularPrimeiraParcelaSAC(100000, 120, 0.9489);
    const valor = arredondar2Decimais(parcela);
    expect(dentroDaToleranciaMon(valor, 1782.23)).toBe(true);
  });
});

describe('calcularUltimaParcelaSAC', () => {
  /**
   * Ultima parcela SAC = amortizacao * (1 + taxa)
   * P = 200.000, n = 360, taxa = 0.8355%
   * amort = 555,56; ultima = 555,56 * 1.008355 = 560,20
   */
  it('R$200.000 em 360x a 0.8355%/m => ultima parcela ~R$560,20', () => {
    const parcela = calcularUltimaParcelaSAC(200000, 360, 0.8355);
    const valor = arredondar2Decimais(parcela);
    expect(dentroDaToleranciaMon(valor, 560.20)).toBe(true);
  });
});

// ==========================================================================
// 5. calcularTotalPagoSAC
// ==========================================================================
describe('calcularTotalPagoSAC', () => {
  /**
   * Total SAC = P + (P * i * (n+1)) / 2
   * P = 200.000, n = 360, i = 0.008355
   * Juros = 200000 * 0.008355 * 361 / 2 = 301.615,50
   * Total = 200.000 + 301.615,50 = 501.615,50
   * Decimal.js (prec=15): 501615.50
   */
  it('R$200.000 em 360x a 0.8355%/m => total ~R$501.615,50', () => {
    const total = calcularTotalPagoSAC(200000, 360, 0.8355);
    const valor = arredondar2Decimais(total);
    expect(dentroDaToleranciaMon(valor, 501615.50)).toBe(true);
  });
});

// ==========================================================================
// 6. calcularComprometimentoRenda
// ==========================================================================
describe('calcularComprometimentoRenda', () => {
  it('parcela R$1.930 sobre renda R$8.000 => ~24,13%', () => {
    const resultado = calcularComprometimentoRenda(1930, 8000);
    const valor = arredondar2Decimais(resultado);
    expect(Math.abs(valor - 24.13)).toBeLessThanOrEqual(TOLERANCIA_MONETARIA);
  });

  it('renda zero deve retornar 0', () => {
    const resultado = calcularComprometimentoRenda(1000, 0);
    expect(resultado.toNumber()).toBe(0);
  });
});

// ==========================================================================
// 7. calcularTotalJuros
// ==========================================================================
describe('calcularTotalJuros', () => {
  it('total pago 30.000 - principal 25.000 => juros 5.000', () => {
    const juros = calcularTotalJuros(30000, 25000);
    expect(arredondar2Decimais(juros)).toBe(5000.0);
  });
});

// ==========================================================================
// 8. calcularTotalPagoPRICE
// ==========================================================================
describe('calcularTotalPagoPRICE', () => {
  it('parcela R$921,56 x 12 meses => total R$11.058,72', () => {
    const total = calcularTotalPagoPRICE(921.56, 12);
    expect(arredondar2Decimais(total)).toBe(11058.72);
  });
});

// ==========================================================================
// 9. roundMoney (atalho para arredondamento monetario)
// ==========================================================================
describe('roundMoney', () => {
  it('1234.566 => 1234.57', () => {
    expect(roundMoney(1234.566)).toBe(1234.57);
  });

  it('1234.564 => 1234.56', () => {
    expect(roundMoney(1234.564)).toBe(1234.56);
  });

  it('0.005 => 0.01 (ROUND_HALF_UP)', () => {
    expect(roundMoney(0.005)).toBe(0.01);
  });
});
