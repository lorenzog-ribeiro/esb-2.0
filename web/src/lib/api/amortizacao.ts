import { AmortizacaoSacInput, AmortizacaoSacOutput, AmortizacaoSacOutputSchema } from '../schemas/amortizacao.schema';
import { apiClient } from './client';


export const amortizacaoSacApi = {
    input: (d: AmortizacaoSacInput) => {
        const backend: any = {
            valorFinanciamento: (d as any).valorFinanciamento ?? d.saldoDevedorAtual,
            taxaJurosAnual: d.taxaJurosAnual,
            prazoMeses: d.prazoOperacaoMeses,
            seguroMensal: d.valorSeguroMensal ?? 0,
            taxaAdministracao: d.taxaAdministracaoMensal ?? 0,
            parcelaAtual: d.numeroParcela,
            saldoDevedorAtual: d.saldoDevedorAtual,
            nome: d.nome,
            email: d.email,
            email_opt_in_simulation: d.email_opt_in_simulation,
            email_opt_in_content: (d as any).email_opt_in_content ?? true,
        };

        const extra = (d as any).amortizacaoExtraordinaria ?? 0;
        if (extra && extra > 0) {
            backend.amortizacoesExtraordinarias = [
                {
                    valor: extra,
                    mesOcorrencia: d.numeroParcela ?? 0,
                },
            ];
        }

        return backend;
    },

    simular: async (data: AmortizacaoSacInput): Promise<AmortizacaoSacOutput> => {
        const payload = amortizacaoSacApi.input(data);
        const response = await apiClient.post('/simuladores/amortizacao', payload);
        const res = response.data;

        const situacaoAtual = {
            prestacaoAtual: data.amortizacaoMensalAtual ?? 0,
            prazoRestanteAtual: data.prazoOperacaoMeses ?? 0,
            saldoDevedorAtual: data.saldoDevedorAtual ?? 0,
            amortizacaoMensalAtual: data.amortizacaoMensalAtual ?? 0,
            jurosAtual: 0,
            totalPagarSemAmortizacao: 0,
            graficoProgressao: {
                labels: [],
                saldoDevedor: [],
                amortizacao: [],
                juros: [],
                prestacao: [],
                totalPagoAcumulado: [],
                jurosAcumulados: [],
            },
        };

        const mapResumoToPorPrazo = (r: any) => ({
            novaPrestacao: r.novaPrestacao ?? 0,
            prazoRestante: r.prazoRestante ?? 0,
            saldoDevedor: r.saldoDevedor ?? 0,
            novaAmortizacaoMensal: r.novaAmortizacaoMensal ?? 0,
            proximosJuros: r.proximosJuros ?? 0,
            economiaJuros: r.economiaJuros ?? 0,
            reducaoPrazo: r.reducaoPrazo ?? 0,
            graficoProgressao: {
                labels: [],
                saldoDevedor: [],
                amortizacao: [],
                juros: [],
                prestacao: [],
                totalPagoAcumulado: [],
                jurosAcumulados: [],
            },
        });

        const mapResumoToPorPrestacao = (r: any) => ({
            novaPrestacao: r.novaPrestacao ?? 0,
            prazoRestante: r.prazoRestante ?? 0,
            saldoDevedor: r.saldoDevedor ?? 0,
            novaAmortizacaoMensal: r.novaAmortizacaoMensal ?? 0,
            proximosJuros: r.proximosJuros ?? 0,
            reducaoPrestacao: r.reducaoPrestacao ?? 0,
            economiaJuros: r.economiaJuros ?? 0,
            graficoProgressao: {
                labels: [],
                saldoDevedor: [],
                amortizacao: [],
                juros: [],
                prestacao: [],
                totalPagoAcumulado: [],
                jurosAcumulados: [],
            },
        });

        let amortizacaoPorPrazo = null;
        let amortizacaoPorPrestacao = null;

        if (res?.resumo) {
            const s = res.resumo;
            if (s.sistemaAmortizacao === 'POR_PRAZO') amortizacaoPorPrazo = mapResumoToPorPrazo(s);
            if (s.sistemaAmortizacao === 'POR_PRESTACAO') amortizacaoPorPrestacao = mapResumoToPorPrestacao(s);
        }

        if (!amortizacaoPorPrazo && Array.isArray(res?.simulacoes)) {
            res.simulacoes.forEach((x: any) => {
                const r = x.resumo ?? x;
                if (r.sistemaAmortizacao === 'POR_PRAZO') amortizacaoPorPrazo = mapResumoToPorPrazo(r);
                if (r.sistemaAmortizacao === 'POR_PRESTACAO') amortizacaoPorPrestacao = mapResumoToPorPrestacao(r);
            });
        }

        const output: AmortizacaoSacOutput = {
            situacaoAtual,
            amortizacaoPorPrazo: amortizacaoPorPrazo ?? undefined,
            amortizacaoPorPrestacao: amortizacaoPorPrestacao ?? undefined,
        } as any;

        return AmortizacaoSacOutputSchema.parse(output);
    },

    comparar: async (data: AmortizacaoSacInput): Promise<any> => {
        const payload = amortizacaoSacApi.input(data);
        const response = await apiClient.post('/simuladores/amortizacao/comparar', payload);
        return response.data;
    },
};