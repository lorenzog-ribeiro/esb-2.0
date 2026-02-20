import { z } from 'zod';

/**
 * Enum para tipo de pessoa
 */
export enum TipoPessoa {
  FISICA = 'fisica',
  JURIDICA = 'juridica',
}

/**
 * Schema base para simulação de contas digitais
 * Contém campos comuns para PF e PJ
 */
const ContasDigitaisBaseSchema = z.object({
  tipoPessoa: z.nativeEnum(TipoPessoa),

  temConta: z.boolean(),

  tarifa: z
    .number()
    .min(0, 'Tarifa deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  saques: z
    .number()
    .min(0, 'Número de saques deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  nDocs: z
    .number()
    .min(0, 'Número de DOCs deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  nTeds: z
    .number()
    .min(0, 'Número de TEDs deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  debito: z.boolean(),

  nome: z.string().min(1, 'Nome é obrigatório'),

  email: z.string().email('Email inválido'),

  email_opt_in_simulation: z.boolean(),

  email_opt_in_content: z.boolean(),
});

/**
 * Schema para simulação de contas digitais - Pessoa Física
 */
export const ContasDigitaisFisicaInputSchema = ContasDigitaisBaseSchema.extend({
  tipoPessoa: z.literal(TipoPessoa.FISICA),

  nDepositos: z
    .number()
    .min(0, 'Número de depósitos deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  credito: z.boolean(),

  investimentos: z.boolean(),

  transferencias: z.boolean(),

  depCheque: z.boolean(),
});

/**
 * Schema para simulação de contas digitais - Pessoa Jurídica
 */
export const ContasDigitaisJuridicaInputSchema = ContasDigitaisBaseSchema.extend({
  tipoPessoa: z.literal(TipoPessoa.JURIDICA),

  boletos: z
    .number()
    .min(0, 'Número de boletos deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  maquininha: z.boolean(),

  folhaPagamento: z.boolean(),

  cartaoVirtual: z.boolean(),
});

/**
 * Schema união para aceitar ambos os tipos
 */
export const ContasDigitaisInputSchema = z.discriminatedUnion('tipoPessoa', [
  ContasDigitaisFisicaInputSchema,
  ContasDigitaisJuridicaInputSchema,
]);

/**
 * Schema para funcionalidades da conta digital
 */
export const FeaturesContaDigitalSchema = z.object({
  enviaDoc: z.boolean(),
  recebeDoc: z.boolean(),
  enviaTed: z.boolean(),
  recebeTed: z.boolean(),
  cartaoDebito: z.boolean(),
  cartaoCredito: z.boolean(),
  realizaSaque: z.boolean(),
  aceitaDeposito: z.boolean(),
  aceitaDepositoImagem: z.boolean(),
  realizaInvestimento: z.boolean(),
  emiteBoleto: z.boolean(),
  maquininhaInclusa: z.boolean(),
  cartaoVirtual: z.boolean(),
  folhaPagamento: z.boolean(),
});

/**
 * Schema para resultado individual de conta digital
 */
export const ResultadoContaDigitalSchema = z.object({
  contaId: z.number(),
  nome: z.string(),
  nomeBanco: z.string(),
  logoBanco: z.string().optional(),
  mensalidadeConta: z.number(),
  tipoPessoa: z.nativeEnum(TipoPessoa),
  tarifaTotal: z.number(),
  economia: z.number(),
  features: FeaturesContaDigitalSchema,
  observacao: z.string().optional(),
  ativa: z.boolean(),
  urlSite: z.string().optional(),
});

/**
 * Schema para resultado completo da simulação
 */
export const ContasDigitaisOutputSchema = z.array(ResultadoContaDigitalSchema);

/**
 * Types inferidos dos schemas
 */
export type ContasDigitaisFisicaInput = z.infer<
  typeof ContasDigitaisFisicaInputSchema
>;
export type ContasDigitaisJuridicaInput = z.infer<
  typeof ContasDigitaisJuridicaInputSchema
>;
export type ContasDigitaisInput = z.infer<typeof ContasDigitaisInputSchema>;
export type ResultadoContaDigital = z.infer<typeof ResultadoContaDigitalSchema>;
export type ContasDigitaisOutput = z.infer<typeof ContasDigitaisOutputSchema>;
export type FeaturesContaDigital = z.infer<typeof FeaturesContaDigitalSchema>;

/**
 * Labels para exibição no formulário
 */
export const TIPO_PESSOA_LABELS: Record<TipoPessoa, string> = {
  [TipoPessoa.FISICA]: 'Pessoa Física',
  [TipoPessoa.JURIDICA]: 'Pessoa Jurídica',
};

/**
 * Labels para features
 */
export const FEATURES_LABELS: Record<keyof FeaturesContaDigital, string> = {
  enviaDoc: 'Envia DOC',
  recebeDoc: 'Recebe DOC',
  enviaTed: 'Envia TED/PIX',
  recebeTed: 'Recebe TED/PIX',
  cartaoDebito: 'Cartão de Débito',
  cartaoCredito: 'Cartão de Crédito',
  realizaSaque: 'Realiza Saques',
  aceitaDeposito: 'Aceita Depósitos',
  aceitaDepositoImagem: 'Depósito de Cheque por Imagem',
  realizaInvestimento: 'Investimentos',
  emiteBoleto: 'Emite Boletos',
  maquininhaInclusa: 'Maquininha Inclusa',
  cartaoVirtual: 'Cartão Virtual',
  folhaPagamento: 'Folha de Pagamento',
};
