import { z } from 'zod';

export const RendaFixaInputSchema = z.object({
  investimentoInicial: z
    .number()
    .min(0, 'Investimento inicial deve ser maior ou igual a zero'),
  prazoMeses: z
    .number()
    .min(1, 'Prazo deve ser pelo menos 1 mês'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  email_opt_in_simulation: z.boolean(),
  email_opt_in_content: z.boolean(),
});

export const ResultadoModalidadeSchema = z.object({
  taxa: z.number(),
  resultado: z.number(),
  imposto: z.number(),
  rendimentoLiquido: z.number(),
  percentualRendimento: z.number(),
  percentualRendimentoMensal: z.number(),
  percentualRendimentoAnual: z.number(),
});

/**
 * Schema para oferta individual de investimento (CDB/LCI)
 */
export const InvestimentoOfertaSchema = z.object({
  corretora: z.string(),
  emissor: z.string(),
  taxa: z.string(),
  vencimento: z.string(),
  qtdMinima: z.number(),
  vl: z.number(),
});

/**
 * Schema para oferta de Tesouro Direto/SELIC
 */
export const OfertaTesouroSchema = z.object({
  nom: z.string(),
  tipo: z.string(),
  tx: z.number(),
  data_vencto: z.string(),
  vlr: z.number(),
});

export const RendaFixaOutputSchema = z.object({
  poupanca: ResultadoModalidadeSchema,
  tesouroDireto: ResultadoModalidadeSchema,
  lci: ResultadoModalidadeSchema,
  cdb: ResultadoModalidadeSchema,
  melhorInvestimento: z.string(),
  melhorRendimento: z.number(),
  totalInvestido: z.number(),
  taxaSelic: z.number(),
  taxaCdi: z.number(),
  taxaTr: z.number(),
  ofertasDetalhadas: z
    .union([z.array(InvestimentoOfertaSchema), z.array(OfertaTesouroSchema)])
    .optional(),
  tipoOfertasDetalhadas: z.string().optional(),
});

export type RendaFixaInput = z.infer<typeof RendaFixaInputSchema>;
export type RendaFixaOutput = z.infer<typeof RendaFixaOutputSchema>;
export type ResultadoModalidade = z.infer<typeof ResultadoModalidadeSchema>;
export type InvestimentoOferta = z.infer<typeof InvestimentoOfertaSchema>;
export type OfertaTesouro = z.infer<typeof OfertaTesouroSchema>;
