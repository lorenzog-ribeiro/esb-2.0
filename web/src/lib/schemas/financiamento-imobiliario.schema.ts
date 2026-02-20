import { z } from 'zod';

/**
 * Schema para entrada de simulação de financiamento imobiliário
 */
export const FinanciamentoImobiliarioInputSchema = z.object({
  valorImovel: z
    .number()
    .min(1, 'Valor do imóvel deve ser maior que zero')
    .transform((val) => Number(val)),

  valorEntrada: z
    .number()
    .min(0, 'Valor da entrada deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  prazoMeses: z
    .number()
    .min(1, 'Prazo deve ser pelo menos 1 mês')
    .max(420, 'Prazo máximo é de 420 meses (35 anos)')
    .transform((val) => Number(val)),

  rendaMensal: z
    .number()
    .min(1, 'Renda mensal deve ser maior que zero')
    .transform((val) => Number(val)),

  nome: z.string().min(1, 'Nome é obrigatório'),

  email: z.string().email('Email inválido'),

  email_opt_in_simulation: z.boolean(),

  email_opt_in_content: z.boolean(),
});

/**
 * Schema para uma oferta de financiamento imobiliário individual
 */
export const OfertaFinanciamentoImobiliarioSchema = z.object({
  nomeBanco: z.string(),
  modalidade: z.string(),
  parcelaInicial: z.number(),
  parcelaFinal: z.number(),
  valorTotal: z.number(),
  taxaJurosAnual: z.number(),
  taxaJurosMensal: z.number(),
  comprometimentoRenda: z.number(),
  logo: z.string().optional(),
});

/**
 * Schema para resultado de simulação de financiamento imobiliário
 * Note: O backend retorna um array de ofertas, não um objeto com melhorOferta
 */
export const FinanciamentoImobiliarioOutputSchema = z.array(
  OfertaFinanciamentoImobiliarioSchema
);

/**
 * Types inferidos dos schemas
 */
export type FinanciamentoImobiliarioInput = z.infer<
  typeof FinanciamentoImobiliarioInputSchema
>;
export type OfertaFinanciamentoImobiliario = z.infer<
  typeof OfertaFinanciamentoImobiliarioSchema
>;
export type FinanciamentoImobiliarioOutput = z.infer<
  typeof FinanciamentoImobiliarioOutputSchema
>;
