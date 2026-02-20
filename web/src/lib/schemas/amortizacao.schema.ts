import { z } from 'zod';

export const AmortizacaoSacInputSchema = z.object({
    saldoDevedorAtual: z.number().min(0, 'Saldo devedor deve ser positivo'),
    amortizacaoMensalAtual: z.number().min(0, 'Amortização mensal deve ser positiva'),
    taxaJurosAnual: z.number().min(0, 'Taxa de juros deve ser positiva'),
    prazoOperacaoMeses: z.number().int().min(1, 'Prazo deve ser pelo menos 1 mês'),
    numeroParcela: z.number().int().min(1, 'Número da parcela deve ser pelo menos 1'),
    valorSeguroMensal: z.number().min(0, 'Valor do seguro deve ser positivo'),
    taxaAdministracaoMensal: z.number().min(0, 'Taxa de administração deve ser positiva'),
    amortizacaoExtraordinaria: z.number().min(0, 'Amortização extraordinária deve ser positiva'),
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    email_opt_in_simulation: z.boolean(),
    email_opt_in_content: z.boolean(),
});

export const GraficoProgressaoSchema = z.object({
    labels: z.array(z.string()),
    saldoDevedor: z.array(z.number()),
    amortizacao: z.array(z.number()),
    juros: z.array(z.number()),
    prestacao: z.array(z.number()),
    totalPagoAcumulado: z.array(z.number()),
    jurosAcumulados: z.array(z.number()),
});

export const SituacaoAtualSchema = z.object({
    prestacaoAtual: z.number(),
    prazoRestanteAtual: z.number(),
    saldoDevedorAtual: z.number(),
    amortizacaoMensalAtual: z.number(),
    jurosAtual: z.number(),
    totalPagarSemAmortizacao: z.number(),
    graficoProgressao: GraficoProgressaoSchema,
});

export const AmortizacaoPorPrazoSchema = z.object({
    novaPrestacao: z.number(),
    prazoRestante: z.number(),
    saldoDevedor: z.number(),
    novaAmortizacaoMensal: z.number(),
    proximosJuros: z.number(),
    economiaJuros: z.number(),
    reducaoPrazo: z.number(),
    graficoProgressao: GraficoProgressaoSchema,
});

export const AmortizacaoPorPrestacaoSchema = z.object({
    novaPrestacao: z.number(),
    prazoRestante: z.number(),
    saldoDevedor: z.number(),
    novaAmortizacaoMensal: z.number(),
    proximosJuros: z.number(),
    reducaoPrestacao: z.number(),
    economiaJuros: z.number(),
    graficoProgressao: GraficoProgressaoSchema,
});

export const AmortizacaoSacOutputSchema = z.object({
    situacaoAtual: SituacaoAtualSchema,
    amortizacaoPorPrazo: AmortizacaoPorPrazoSchema.optional(),
    amortizacaoPorPrestacao: AmortizacaoPorPrestacaoSchema.optional(),
});

export type AmortizacaoSacInput = z.infer<typeof AmortizacaoSacInputSchema>;
export type AmortizacaoSacOutput = z.infer<typeof AmortizacaoSacOutputSchema>;
export type GraficoProgressao = z.infer<typeof GraficoProgressaoSchema>;