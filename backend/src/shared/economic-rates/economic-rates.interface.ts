/**
 * Taxas macroeconômicas usadas em simuladores.
 * Fonte preferencial: API do Banco Central (BCB).
 * Fallback: variáveis de ambiente ou valores default.
 */
export interface EconomicRates {
  /** Taxa SELIC anual (%) - Série BCB 432 */
  selicAnual: number;
  /** Taxa CDI anual (%) - Série BCB 12, convertida de diária */
  cdiAnual: number;
  /** Taxa Referencial (TR) mensal em decimal - Série BCB 226. Ex: 0.002 = 0.2% */
  trMensal: number;
  /** Fator TR para correção de saldo: (1 + TR/100). Ex: 1.002 para TR 0.2% */
  trFactor: number;
}
