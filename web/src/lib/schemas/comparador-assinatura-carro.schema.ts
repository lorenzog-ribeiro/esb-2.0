import { z } from 'zod';

/**
 * Schema para entrada do comparador de assinatura de carro
 *
 * Alinhado com a versão legacy. Os campos devem corresponder exatamente aos esperados pelo backend.
 */
export const ComparadorAssinaturaCarroInputSchema = z.object({
  valorVeiculo: z
    .number()
    .min(1, 'Valor do veículo deve ser maior que zero')
    .transform((val) => Number(val)),

  entradaFinanciamento: z
    .number()
    .min(0, 'Valor da entrada deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  prazoFinanciamentoMeses: z
    .number()
    .min(6, 'Prazo deve ser pelo menos 6 meses')
    .max(60, 'Prazo máximo é de 60 meses')
    .transform((val) => Number(val)),

  valorAssinaturaMensal: z
    .number()
    .min(1, 'Valor da assinatura mensal deve ser maior que zero')
    .transform((val) => Number(val)),

  prazoAssinaturaMeses: z
    .number()
    .min(12, 'Prazo deve ser pelo menos 12 meses')
    .max(60, 'Prazo máximo é de 60 meses')
    .transform((val) => Number(val)),

  tempoUsoCarroMeses: z
    .number()
    .min(12, 'Tempo de uso do carro deve ser de pelo menos 12 meses')
    .max(60, 'Tempo de uso máximo é de 60 meses')
    .transform((val) => Number(val)),

  nome: z.string().min(1, 'Nome é obrigatório'),

  email: z.string().email('Email inválido'),

  email_opt_in_simulation: z.boolean(),

  email_opt_in_content: z.boolean(),
});

/**
 * Schema para breakdown de custos
 *
 * Campos opcionais são específicos de cada cenário:
 * - custoAssinatura: apenas para assinatura
 * - jurosFinanciamento e iofFinanciamento: apenas para financiamento
 */
export const BreakdownCustosSchema = z.object({
  custoAquisicao: z.number(),
  manutencao: z.number(),
  seguro: z.number(),
  ipva: z.number(),
  taxasLicenciamento: z.number(),
  depreciacao: z.number(),
  custoOportunidade: z.number(),
  custoAssinatura: z.number().optional(),
  jurosFinanciamento: z.number().optional(),
  iofFinanciamento: z.number().optional(),
});

/**
 * Schema para uma opção de aquisição
 */
export const OpcaoAquisicaoSchema = z.object({
  nome: z.string(),
  custoTotal: z.number(),
  valorRevenda: z.number(),
  custoLiquido: z.number(),
  breakdown: BreakdownCustosSchema,
});

/**
 * Schema para resultado da comparação
 */
export const ComparadorAssinaturaCarroOutputSchema = z.object({
  compraVista: OpcaoAquisicaoSchema,
  financiamento: OpcaoAquisicaoSchema,
  assinatura: OpcaoAquisicaoSchema,
  melhorOpcao: z.enum(['compraVista', 'financiamento', 'assinatura']),
  economiaMaxima: z.number(),
  periodoAnos: z.number(),
  urls: z.object({
    assinatura: z.string(),
    financiamento: z.string(),
  }),
});

/**
 * Types inferidos dos schemas
 */
export type ComparadorAssinaturaCarroInput = z.infer<
  typeof ComparadorAssinaturaCarroInputSchema
>;
export type BreakdownCustos = z.infer<typeof BreakdownCustosSchema>;
export type OpcaoAquisicao = z.infer<typeof OpcaoAquisicaoSchema>;
export type ComparadorAssinaturaCarroOutput = z.infer<
  typeof ComparadorAssinaturaCarroOutputSchema
>;

/**
 * Labels para tipos de melhor opção
 */
export const MELHOR_OPCAO_LABELS: Record<
  'compraVista' | 'financiamento' | 'assinatura',
  string
> = {
  compraVista: 'Compra à Vista',
  financiamento: 'Financiamento',
  assinatura: 'Assinatura',
};
