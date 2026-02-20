import { z } from 'zod';

/**
 * Schema para entrada de comparação de maquininhas
 * Baseado no backend DTO: CompararMaquininhaDto
 */
export const ComparadorMaquininhaInputSchema = z.object({
  maquininhas_ids: z
    .array(z.number())
    .min(2, 'Selecione pelo menos 2 maquininhas para comparar')
    .max(3, 'Máximo de 3 maquininhas para comparar'),

  nome: z.string().min(1, 'Nome é obrigatório'),

  email: z.string().email('Email inválido'),

  email_opt_in_simulation: z.boolean(),

  email_opt_in_content: z.boolean(),

  compartilharDados: z.boolean(),

  origem: z.string(),
});

/**
 * Schema para plano de maquininha
 */
export const PlanoComparacaoSchema = z.object({
  id: z.number(),
  nome: z.string(),
  taxa_debito: z.string(),
  taxa_credito_vista: z.string(),
  taxa_credito_parcelado_min: z.string(),
  dias_repasse_debito: z.number(),
  dias_repasse_credito: z.number(),
  avaliacao: z.number(),
});

/**
 * Schema para características de uma maquininha
 */
export const CaracteristicasMaquininhaSchema = z.object({
  id: z.number(),
  nome: z.string(),
  empresa: z.string(),
  logo: z.string(),
  imagem: z.string(),
  preco: z.number(),
  preco_promocional: z.number().nullable(),
  mensalidade: z.number(),
  chip: z.boolean(),
  tarja: z.boolean(),
  nfc: z.boolean(),
  com_fio: z.boolean(),
  imprime_recibo: z.boolean(),
  precisa_smartphone: z.boolean(),
  permite_antecipacao: z.boolean(),
  atende_pf: z.boolean(),
  atende_pj: z.boolean(),
  vale_refeicao: z.boolean(),
  ecommerce: z.boolean(),
  max_parcelas: z.number(),
  garantia: z.number().nullable(),
  tipos_conexao: z.array(z.string()),
  bandeiras: z.array(z.string()),
  formas_recebimento: z.array(z.string()),
  observacoes: z.string().nullable(),
  url_contratacao: z.string(),
  cupom: z.string().nullable(),
  transparencia: z.number().nullable(),
  url_avaliacao: z.string().nullable(),
  data_atualizacao: z.string(),
  planos: z.array(PlanoComparacaoSchema),
});

/**
 * Schema para resultado da comparação
 */
export const ResultadoComparacaoSchema = z.object({
  maquininhas: z.array(CaracteristicasMaquininhaSchema),
  total: z.number(),
});

// Types derivados dos schemas
export type ComparadorMaquininhaInput = z.infer<
  typeof ComparadorMaquininhaInputSchema
>;
export type CaracteristicasMaquininha = z.infer<
  typeof CaracteristicasMaquininhaSchema
>;
export type PlanoComparacao = z.infer<typeof PlanoComparacaoSchema>;
export type ResultadoComparacao = z.infer<typeof ResultadoComparacaoSchema>;

/**
 * Schema para opção de maquininha disponível para seleção
 */
export const MaquininhaOpcaoSchema = z.object({
  id: z.number(),
  nome: z.string(),
  empresa: z.string(),
  logo: z.string(),
});

/**
 * Schema para lista de maquininhas disponíveis
 */
export const ListaMaquininhasSchema = z.object({
  maquininhas: z.array(MaquininhaOpcaoSchema),
  total: z.number(),
});

// Types derivados dos schemas
export type MaquininhaOpcao = z.infer<typeof MaquininhaOpcaoSchema>;
export type ListaMaquininhas = z.infer<typeof ListaMaquininhasSchema>;
