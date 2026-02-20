import { z } from 'zod';

/**
 * Enum para tipo de pessoa
 */
export enum TipoPessoa {
  PF = 'PF',
  PJ = 'PJ',
}

/**
 * Enum para tipo de emprego (apenas para PF)
 */
export enum TipoEmprego {
  APOSENTADO = 'aposentado',
  CLT = 'clt',
  SERVIDOR_PUBLICO = 'servidor_publico',
}

/**
 * Schema para entrada de simulação de empréstimo
 */
export const EmprestimoInputSchema = z.object({
  tipoPessoa: z.nativeEnum(TipoPessoa),

  tipoEmprego: z.nativeEnum(TipoEmprego).optional(),

  valorDesejado: z
    .number()
    .min(0, 'Valor deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  prazoMeses: z
    .number()
    .min(1, 'Prazo deve ser pelo menos 1 mês')
    .transform((val) => Number(val)),

  renda: z
    .number()
    .min(0, 'Renda deve ser maior ou igual a zero')
    .optional()
    .transform((val) => (val === undefined ? undefined : Number(val))),

  nome: z.string().min(1, 'Nome é obrigatório'),

  email: z.string().email('Email inválido'),

  email_opt_in_simulation: z.boolean(),

  email_opt_in_content: z.boolean(),

  origem: z.string(),
});

/**
 * Schema para uma oferta de empréstimo individual
 */
export const OfertaEmprestimoSchema = z.object({
  nomeBanco: z.string(),
  modalidade: z.string(),
  valorEmprestimo: z.number(),
  prazoMeses: z.number(),
  parcelaMensal: z.number(),
  taxaMensal: z.number(),
  taxaAnual: z.number(),
  totalPago: z.number(),
  totalJuros: z.number(),
  taxaEfetivaAnual: z.number(),
  logo: z.string().optional(),
  comprometimentoRenda: z.number().optional(),
});

/**
 * Schema para resultado de simulação de empréstimo
 */
export const EmprestimoOutputSchema = z.object({
  ofertas: z.array(OfertaEmprestimoSchema),
  totalOfertas: z.number(),
  melhorOferta: OfertaEmprestimoSchema,
  tipoPessoa: z.string(),
  tipoEmprego: z.string().optional(),
  inputData: z.object({
    valorDesejado: z.number(),
    prazoMeses: z.number(),
    renda: z.number().optional(),
  }),
});

/**
 * Types inferidos dos schemas
 */
export type EmprestimoInput = z.infer<typeof EmprestimoInputSchema>;
export type EmprestimoOutput = z.infer<typeof EmprestimoOutputSchema>;
export type OfertaEmprestimo = z.infer<typeof OfertaEmprestimoSchema>;

/**
 * Labels para exibição no formulário
 */
export const TIPO_PESSOA_LABELS: Record<TipoPessoa, string> = {
  [TipoPessoa.PF]: 'Pessoa Física',
  [TipoPessoa.PJ]: 'Pessoa Jurídica',
};

export const TIPO_EMPREGO_LABELS: Record<TipoEmprego, string> = {
  [TipoEmprego.APOSENTADO]: 'Aposentado / Pensionista',
  [TipoEmprego.CLT]: 'Trabalhador CLT (Empresa Privada)',
  [TipoEmprego.SERVIDOR_PUBLICO]: 'Servidor Público',
};
