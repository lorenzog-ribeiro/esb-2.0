import { z } from 'zod';

/**
 * Enum para tipo de veículo
 */
export enum TipoVeiculo {
  NOVO = 'novo',
  USADO = 'usado',
}

/**
 * Schema para entrada de simulação de financiamento de veículos
 */
export const FinanciamentoVeiculoInputSchema = z.object({
  valorVeiculo: z
    .number()
    .min(1, 'Valor do veículo deve ser maior que zero')
    .transform((val) => Number(val)),

  valorEntrada: z
    .number()
    .min(0, 'Valor da entrada deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  prazoMeses: z
    .number()
    .min(1, 'Prazo deve ser pelo menos 1 mês')
    .max(60, 'Prazo máximo é de 60 meses')
    .transform((val) => Number(val)),

  rendaMensal: z
    .number()
    .min(1, 'Renda mensal deve ser maior que zero')
    .transform((val) => Number(val)),

  tipoVeiculo: z.nativeEnum(TipoVeiculo),

  nome: z.string().min(1, 'Nome é obrigatório'),

  email: z.string().email('Email inválido'),

  email_opt_in_simulation: z.boolean(),

  email_opt_in_content: z.boolean(),
});

/**
 * Schema para uma oferta de financiamento de veículo individual
 */
export const OfertaFinanciamentoVeiculoSchema = z.object({
  nomeBanco: z.string(),
  modalidade: z.string(),
  parcelaMensal: z.number(),
  valorTotal: z.number(),
  valorIOF: z.number(),
  taxaJurosAnual: z.number(),
  taxaJurosMensal: z.number(),
  comprometimentoRenda: z.number(),
});

/**
 * Schema para resultado de simulação de financiamento de veículos
 * O backend retorna um array de ofertas
 */
export const FinanciamentoVeiculoOutputSchema = z.array(
  OfertaFinanciamentoVeiculoSchema
);

/**
 * Types inferidos dos schemas
 */
export type FinanciamentoVeiculoInput = z.infer<
  typeof FinanciamentoVeiculoInputSchema
>;
export type OfertaFinanciamentoVeiculo = z.infer<
  typeof OfertaFinanciamentoVeiculoSchema
>;
export type FinanciamentoVeiculoOutput = z.infer<
  typeof FinanciamentoVeiculoOutputSchema
>;

/**
 * Labels para exibição no formulário
 */
export const TIPO_VEICULO_LABELS: Record<TipoVeiculo, string> = {
  [TipoVeiculo.NOVO]: 'Novo',
  [TipoVeiculo.USADO]: 'Usado',
};
