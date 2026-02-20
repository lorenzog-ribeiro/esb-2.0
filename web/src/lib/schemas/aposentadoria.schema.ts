import { z } from 'zod';

export enum ModoCalculoAposentadoria {
    RECEBER = 'RECEBER',
    CONTRIBUIR = 'CONTRIBUIR',
}

export const SimularAposentadoriaInputSchema = z.object({
    modoCalculo: z.nativeEnum(ModoCalculoAposentadoria),
    idadeAtual: z.number().int().min(0, 'Idade atual deve ser no mínimo 0').max(100, 'Idade atual deve ser no máximo 100'),
    idadeAposentadoria: z.number().int().min(1, 'Idade de aposentadoria deve ser no mínimo 1').max(100, 'Idade de aposentadoria deve ser no máximo 100'),
    valorJaAcumulado: z.number().min(0, 'Valor já acumulado não pode ser negativo'),
    rendaMensalDesejada: z.number().min(0.01, 'Renda mensal desejada deve ser maior que zero').optional(),
    contribuicaoMensal: z.number().min(0.01, 'Contribuição mensal deve ser maior que zero').optional(),
    incluirCenariosSaque: z.boolean(),
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    email_opt_in_simulation: z.boolean(),
    email_opt_in_content: z.boolean(),
}).refine(
    (data) => {
        if (data.modoCalculo === ModoCalculoAposentadoria.RECEBER) {
            return data.rendaMensalDesejada !== undefined && data.rendaMensalDesejada > 0;
        }
        return true;
    },
    {
        message: 'Renda mensal desejada é obrigatória para modo RECEBER',
        path: ['rendaMensalDesejada'],
    }
).refine(
    (data) => {
        if (data.modoCalculo === ModoCalculoAposentadoria.CONTRIBUIR) {
            return data.contribuicaoMensal !== undefined && data.contribuicaoMensal > 0;
        }
        return true;
    },
    {
        message: 'Contribuição mensal é obrigatória para modo CONTRIBUIR',
        path: ['contribuicaoMensal'],
    }
);

export const ParametrosCalculoSchema = z.object({
    idadeAtual: z.number(),
    idadeAposentadoria: z.number(),
    valorJaAcumulado: z.number(),
    taxaJurosMensal: z.number(),
    taxaJurosAnual: z.number(),
    expectativaVida: z.number(),
});

export const AcumulacaoSchema = z.object({
    mesesContribuicao: z.number(),
    anosContribuicao: z.number(),
    contribuicaoMensal: z.number(),
    valorFuturoReserva: z.number(),
    valorFuturoContribuicoes: z.number(),
    valorTotalAcumulado: z.number(),
});

export const UsufrutoSchema = z.object({
    idadeInicio: z.number(),
    idadeFim: z.number(),
    mesesBeneficio: z.number(),
    rendaMensal: z.number(),
    valorTotalRecebido: z.number(),
});

export const CenarioSaqueSchema = z.object({
    valorSaqueMensal: z.number(),
    duracaoMeses: z.number(),
    duracaoAnos: z.number(),
    consumePrincipal: z.boolean(),
    saldoFinal: z.number(),
    observacao: z.string(),
});

export const SustentabilidadeSchema = z.object({
    cenarios: z.array(CenarioSaqueSchema),
});

export const ResumoSchema = z.object({
    totalInvestido: z.number(),
    totalRecebido: z.number(),
    saldoPatrimonial: z.number(),
});

export const ResultadoAposentadoriaSchema = z.object({
    parametros: ParametrosCalculoSchema,
    acumulacao: AcumulacaoSchema,
    usufruto: UsufrutoSchema,
    sustentabilidade: SustentabilidadeSchema,
    resumo: ResumoSchema,
});

export type SimularAposentadoriaInput = z.infer<typeof SimularAposentadoriaInputSchema>;
export type ParametrosCalculo = z.infer<typeof ParametrosCalculoSchema>;
export type Acumulacao = z.infer<typeof AcumulacaoSchema>;
export type Usufruto = z.infer<typeof UsufrutoSchema>;
export type CenarioSaque = z.infer<typeof CenarioSaqueSchema>;
export type Sustentabilidade = z.infer<typeof SustentabilidadeSchema>;
export type Resumo = z.infer<typeof ResumoSchema>;
export type ResultadoAposentadoria = z.infer<typeof ResultadoAposentadoriaSchema>;
