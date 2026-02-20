import { z } from 'zod';

/**
 * Schema para entrada de simulação de taxa de maquininha
 * Baseado no backend DTO: SimularTaxaMaquininhaDto
 */
export const TaxaMaquininhaInputSchema = z.object({
  // Valores de venda mensais
  venda_debito: z
    .number()
    .min(0, 'Valor deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  venda_credito_vista: z
    .number()
    .min(0, 'Valor deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  venda_credito_parcelado: z
    .number()
    .min(0, 'Valor deve ser maior ou igual a zero')
    .transform((val) => Number(val)),

  numero_parcelas: z
    .number()
    .int('Número de parcelas deve ser inteiro')
    .min(2, 'Mínimo de 2 parcelas')
    .max(12, 'Máximo de 12 parcelas')
    .transform((val) => Number(val)),

  // Filtros opcionais
  segmento: z.number().optional(),
  sem_mensalidade: z.boolean(),
  aceita_cartao_tarja: z.boolean(),
  sem_fio: z.boolean(),
  pf: z.boolean(),
  pj: z.boolean(),
  imprime_recibo: z.boolean(),
  wifi: z.boolean(),
  quer_antecipar: z.boolean(),
  n_exige_smartphone: z.boolean(),
  aceita_vale_refeicao: z.boolean(),
  ecommerce: z.boolean(),

  // Metadados
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  email_opt_in_simulation: z.boolean(),
  email_opt_in_content: z.boolean(),
  compartilharDados: z.boolean(),
  origem: z.string(),
});

/**
 * Schema para tipo de conexão
 */
export const TipoConexaoSchema = z.object({
  nome: z.string(),
});

/**
 * Schema para forma de recebimento
 */
export const FormaRecebimentoSchema = z.object({
  nome: z.string(),
});

/**
 * Schema para bandeira de cartão
 */
export const BandeiraSchema = z.object({
  nome: z.string(),
  classeCss: z.string().optional(),
  imagem: z.string().optional(),
});

/**
 * Schema para uma maquininha calculada (resultado individual)
 */
export const MaquininhaCalculadaSchema = z.object({
  nome: z.string(),
  id_maq: z.number(),
  empresa: z.string(),
  empresa_cnpj: z.string(),
  logo: z.string(),
  imagem_maquina: z.string(),
  valor_mensal: z.number(),
  valor_mensalidade: z.number(),
  valor_transacao: z.number(),
  valor_selo: z.union([z.number(), z.string()]),
  dias_debito: z.number(),
  dias_credito: z.number(),
  tipo_dias_credito: z.string(),
  dias_credito_parcelado: z.number(),
  tipo_recebimento_parcelado: z.boolean(),
  co_cartao: z.number(),
  site: z.string(),
  observacao: z.string().nullable(),
  cupom: z.string().nullable(),
  possibilidade_parcelamento: z.number(),
  afiliacao_a_banco: z.boolean(),
  chip: z.boolean(),
  tarja: z.boolean(),
  NFC: z.boolean(),
  wifi: z.boolean(),
  PF: z.boolean(),
  PJ: z.boolean(),
  precisa_de_telefone: z.boolean(),
  fio: z.boolean(),
  imprime_recibo: z.boolean(),
  garantia: z.number().nullable(),
  possivel_antecipacao: z.boolean(),
  antecipado: z.boolean(),
  opcao_ecommerce: z.boolean(),
  taxas_transparentes: z.boolean(),
  vale_refeicao: z.boolean(),
  tipo_conexoes: z.array(TipoConexaoSchema),
  forma_recebimento: z.array(FormaRecebimentoSchema),
  bandeiras: z.array(BandeiraSchema),
  avaliacao: z.number(),
  data_atualizacao: z.string(),
  url_avaliacao: z.string().nullable(),
  cruzamentos: z.array(z.any()),
  tem_parceria: z.boolean(),
});

/**
 * Schema para resultado de simulação de taxa de maquininha
 */
export const TaxaMaquininhaOutputSchema = z.object({
  maquininhas: z.array(MaquininhaCalculadaSchema),
  total: z.number(),
  melhor_opcao: MaquininhaCalculadaSchema,
  input_data: z.object({
    venda_debito: z.number(),
    venda_credito_vista: z.number(),
    venda_credito_parcelado: z.number(),
    numero_parcelas: z.number(),
    segmento: z.number().nullable().optional(),
  }),
});

// Types derivados dos schemas
export type TaxaMaquininhaInput = z.infer<typeof TaxaMaquininhaInputSchema>;
export type MaquininhaCalculada = z.infer<typeof MaquininhaCalculadaSchema>;
export type TaxaMaquininhaOutput = z.infer<typeof TaxaMaquininhaOutputSchema>;
export type TipoConexao = z.infer<typeof TipoConexaoSchema>;
export type FormaRecebimento = z.infer<typeof FormaRecebimentoSchema>;
export type Bandeira = z.infer<typeof BandeiraSchema>;

// Labels para exibição
export const FILTROS_LABELS = {
  sem_mensalidade: 'Sem mensalidade',
  aceita_cartao_tarja: 'Aceita cartão de tarja',
  sem_fio: 'Sem fio',
  pf: 'Vende para Pessoa Física',
  pj: 'Vende para Pessoa Jurídica',
  imprime_recibo: 'Imprime recibo',
  wifi: 'Tem Wi-Fi',
  quer_antecipar: 'Permite antecipação',
  n_exige_smartphone: 'Não exige smartphone',
  aceita_vale_refeicao: 'Aceita vale refeição',
  ecommerce: 'Tem opção de e-commerce',
} as const;
