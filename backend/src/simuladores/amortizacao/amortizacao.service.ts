import { Injectable, Logger } from '@nestjs/common';
import { AmortizacaoInputDto } from './dto/amortizacao-input.dto';
import {
  AmortizacaoSimplesOutputDto,
  ResumoSimplesDto,
} from './dto/amortizacao-output.dto';
import { SimulacaoComparativaDto } from './dto/amortizacao-output.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SimulatorType } from '@prisma/client';
import { EmailService } from '../../email/email.service';
import { EconomicRatesService } from '../../shared/economic-rates/economic-rates.service';

@Injectable()
export class AmortizacaoService {
  private readonly logger = new Logger(AmortizacaoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly economicRates: EconomicRatesService,
  ) {}

  async calcularAmortizacao(
    input: AmortizacaoInputDto,
  ): Promise<AmortizacaoSimplesOutputDto> {
    return this.calcularAmortizacaoSimples(input);
  }

  private async salvarSimulacao(
    input: AmortizacaoInputDto,
    output: AmortizacaoSimplesOutputDto,
  ): Promise<void> {
    try {
      const simulationData = {
        simulatorType: SimulatorType.AMORTIZACAO,
        email: input.email,
        nome: input.nome,
        inputData: JSON.parse(JSON.stringify(input)),
        outputData: JSON.parse(JSON.stringify(output)),
        email_opt_in_simulation: input.email_opt_in_simulation,
        email_opt_in_content: input.email_opt_in_content || false,
        email_opt_in_at: input.email_opt_in_simulation ? new Date() : null,
      };

      await this.prisma.simulation.create({ data: simulationData });

      if (input.email_opt_in_simulation) {
        await this.emailService.sendSimulationResult({
          simulationType: SimulatorType.AMORTIZACAO,
          userEmail: input.email,
          userName: input.nome,
          input: simulationData.inputData,
          output: simulationData.outputData,
          summary: output.mensagem || 'Simulação de Amortização',
          createdAt: new Date(),
        });
      }
    } catch (error) {
      this.logger.warn(
        'Failed to save simplified simulation, continuing',
        error?.stack,
      );
    }
  }

  private calcularTaxaJurosMensal(taxaAnual: number): number {
    // Convert annual percentual to effective monthly decimal using original formula:
    // mensal = (1 + anual/100)^(1/12) - 1
    if (!taxaAnual || taxaAnual === 0) return 0;
    const anualDecimal = taxaAnual / 100;
    return Math.pow(1 + anualDecimal, 1 / 12) - 1;
  }

  private computeTotalInterest(
    saldoInicial: number,
    amortizacaoMensal: number,
    taxaMensal: number,
    meses: number,
  ): number {
    // Sum interest over 'meses' months using constant amortizacaoMensal.
    // Adjust the last amortization so the balance never goes negative.
    let saldo = saldoInicial;
    let totalJuros = 0;
    for (let i = 0; i < meses && saldo > 0.000001; i++) {
      const juros = saldo * taxaMensal;
      totalJuros += juros;
      // amortizacao aplicada neste mês
      const amort = Math.min(amortizacaoMensal, saldo);
      saldo = Math.max(0, saldo - amort);
    }
    return totalJuros;
  }

  async calcularAmortizacaoSimples(
    input: AmortizacaoInputDto,
  ): Promise<AmortizacaoSimplesOutputDto> {
    const redactedInput = { ...input, email: '***', nome: '***' };
    this.logger.debug('Calculating simplified amortization', { input: redactedInput });

    const taxaMensal = this.calcularTaxaJurosMensal(input.taxaJurosAnual || 0);
    const saldoInicial = input.saldoDevedorAtual ?? input.valorFinanciamento;
    const prazoTotal = input.prazoMeses || 0;
    const parcelaAtual = input.parcelaAtual || 0;
    const prazoRestante = Math.max(0, prazoTotal - parcelaAtual);

    const seguro = input.seguroMensal || 0;
    const taxaAdm = input.taxaAdministracao || 0;

    let saldoDevedor = saldoInicial;
    if (
      input.amortizacoesExtraordinarias &&
      input.amortizacoesExtraordinarias.length > 0
    ) {
      for (const ae of input.amortizacoesExtraordinarias) {
        if ((ae.mesOcorrencia || 0) <= parcelaAtual) {
          saldoDevedor = Math.max(0, saldoDevedor - (ae.valor || 0));
        }
      }
    }

    const jurosAtual = saldoDevedor * taxaMensal;
    const amortizacaoMensal =
      prazoRestante > 0 ? saldoDevedor / prazoRestante : saldoDevedor;
    const novaPrestacao = jurosAtual + amortizacaoMensal + seguro + taxaAdm;

    const resumo: ResumoSimplesDto = {
      sistemaAmortizacao: 'SIMPLES',
      novaPrestacao: Math.round(novaPrestacao * 100) / 100,
      prazoRestante,
      saldoDevedor: Math.round(saldoDevedor * 100) / 100,
      // provide amortizacao mensal so frontend can show it if needed
      novaAmortizacaoMensal: Math.round(amortizacaoMensal * 100) / 100,
    } as any;

    const output: AmortizacaoSimplesOutputDto = {
      resumo,
      mensagem: 'Simulação simplificada',
    };
    await this.salvarSimulacao(input, output);

    return output;
  }

  async compararSistemas(
    input: AmortizacaoInputDto,
  ): Promise<SimulacaoComparativaDto> {
    const redactedInput = { ...input, email: '***', nome: '***' };
    this.logger.debug('Calculating simplified comparison', { input: redactedInput });

    const taxaMensal = this.calcularTaxaJurosMensal(input.taxaJurosAnual || 0);
    const saldoInicial = input.saldoDevedorAtual ?? input.valorFinanciamento;
    const prazoTotal = input.prazoMeses || 0;
    const parcelaAtual = input.parcelaAtual || 0;
    const prazoRestanteOriginal = Math.max(0, prazoTotal - parcelaAtual);

    // Apply only extraordinary amortizations that have already occurred (mesOcorrencia <= parcelaAtual)
    let somaExtra = 0;
    if (
      input.amortizacoesExtraordinarias &&
      input.amortizacoesExtraordinarias.length > 0
    ) {
      somaExtra = input.amortizacoesExtraordinarias.reduce(
        (s: number, a: any) => {
          const occ = a?.mesOcorrencia || 0;
          return s + (occ <= parcelaAtual ? a?.valor || 0 : 0);
        },
        0,
      );
    }

    const novoSaldo = Math.max(0, saldoInicial - somaExtra);

    const seguro = input.seguroMensal || 0;
    const taxaAdm = input.taxaAdministracao || 0;

    const amortizacaoMensalOriginal =
      prazoTotal > 0 ? input.valorFinanciamento / prazoTotal : 0;

    // ---- POR_PRAZO calculation (paridade Django)
    // TR via BCB API; fallback 1.002 para compatibilidade com calculos.py
    const trEstimada = await this.economicRates.getTrFactor();
    const saldoDev = saldoInicial;
    const amortExtra = somaExtra;

    // saldoTr = (saldoDev - amortExtra) * trEstimada
    const saldoTr = Math.max(0, saldoDev - amortExtra) * trEstimada;
    // saldoAmortizacao = saldoTr - amortMes (use current amortizacao; assume original constant if not provided)
    const amortMes = amortizacaoMensalOriginal;
    const saldoAmortizacao = Math.max(0, saldoTr - amortMes);

    // taxaMensal is already decimal (e.g., 0.0075)
    const prestacaoTemp = amortMes + taxaMensal * saldoDev;
    const taxasSeguro = seguro + taxaAdm;
    const valorPagoTemp = prestacaoTemp + taxasSeguro;

    let aux = prazoTotal - parcelaAtual + 1;
    aux = aux > 0 ? saldoDev / aux : saldoDev;
    aux = valorPagoTemp + aux;
    const prestacaoVirtual = Math.round(aux * 100) / 100 - amortMes;

    const val =
      prestacaoVirtual - seguro - taxaAdm - saldoAmortizacao * taxaMensal;

    let prazoPrazo: number;
    if (val <= 0) {
      // fallback: keep original remaining term
      prazoPrazo = prazoRestanteOriginal;
    } else {
      let prazoRest = Math.floor(saldoAmortizacao / val);
      if (prazoRest <= 0) prazoRest = 1;
      prazoPrazo = Math.min(prazoRest, prazoRestanteOriginal);
    }

    const novaAmortizacaoPrazo =
      prazoPrazo > 0
        ? saldoAmortizacao / prazoPrazo
        : amortizacaoMensalOriginal;
    const novaPrestacaoPrazo =
      saldoAmortizacao * taxaMensal + novaAmortizacaoPrazo + taxasSeguro;

    // ---- POR_PRESTACAO (unchanged) ----
    const novaAmortizacaoPrestacao =
      prazoRestanteOriginal > 0 ? novoSaldo / prazoRestanteOriginal : 0;

    const novaPrestacaoPrestacao =
      novoSaldo * taxaMensal + novaAmortizacaoPrestacao + seguro + taxaAdm;

    // compute interest economy: compare interest over remaining term using original amortizacao vs new schedule
    const mesesOriginais = prazoRestanteOriginal;
    const totalJurosOrig = this.computeTotalInterest(
      novoSaldo,
      amortizacaoMensalOriginal,
      taxaMensal,
      mesesOriginais,
    );
    const totalJurosPrazo = this.computeTotalInterest(
      novoSaldo,
      novaAmortizacaoPrazo,
      taxaMensal,
      prazoPrazo,
    );
    const economiaJurosPrazo =
      Math.round((totalJurosOrig - totalJurosPrazo) * 100) / 100;

    const simulacaoPrazo: AmortizacaoSimplesOutputDto = {
      resumo: {
        sistemaAmortizacao: 'POR_PRAZO',
        novaPrestacao: Math.round(novaPrestacaoPrazo * 100) / 100,
        prazoRestante: prazoPrazo,
        saldoDevedor: Math.round(novoSaldo * 100) / 100,
        novaAmortizacaoMensal: Math.round(novaAmortizacaoPrazo * 100) / 100,
        reducaoPrazo: Math.max(0, prazoRestanteOriginal - prazoPrazo),
        economiaJuros: economiaJurosPrazo,
      },
      mensagem: 'Amortização reduzindo prazo',
    };

    // economia para prestacao: compare interest using original amortizacao vs new amortizacao over original remaining months
    const totalJurosPrestacaoNew = this.computeTotalInterest(
      novoSaldo,
      novaAmortizacaoPrestacao,
      taxaMensal,
      prazoRestanteOriginal,
    );
    const economiaJurosPrestacao =
      Math.round((totalJurosOrig - totalJurosPrestacaoNew) * 100) / 100;

    const amortizacaoAtual =
      prazoRestanteOriginal > 0
        ? saldoInicial / prazoRestanteOriginal
        : saldoInicial;
    const jurosAtualParaReducao = saldoInicial * taxaMensal;
    const prestacaoAtualCalc =
      jurosAtualParaReducao + amortizacaoAtual + seguro + taxaAdm;
    const reducaoPrestacaoVal =
      Math.round(
        Math.max(0, prestacaoAtualCalc - novaPrestacaoPrestacao) * 100,
      ) / 100;

    const simulacaoPrestacao: AmortizacaoSimplesOutputDto = {
      resumo: {
        sistemaAmortizacao: 'POR_PRESTACAO',
        novaPrestacao: Math.round(novaPrestacaoPrestacao * 100) / 100,
        prazoRestante: prazoRestanteOriginal,
        saldoDevedor: Math.round(novoSaldo * 100) / 100,
        novaAmortizacaoMensal: Math.round(novaAmortizacaoPrestacao * 100) / 100,
        reducaoPrestacao: reducaoPrestacaoVal,
        economiaJuros: economiaJurosPrestacao,
      },
      mensagem: 'Amortização reduzindo prestação',
    };

    const simulacoes = [simulacaoPrazo, simulacaoPrestacao];

    const analiseComparativa = {
      sistemaComMenorPrestacao:
        simulacaoPrazo.resumo.novaPrestacao <=
        simulacaoPrestacao.resumo.novaPrestacao
          ? simulacaoPrazo.resumo.sistemaAmortizacao
          : simulacaoPrestacao.resumo.sistemaAmortizacao,
      sistemaComMenorPrazo:
        simulacaoPrazo.resumo.prazoRestante <=
        simulacaoPrestacao.resumo.prazoRestante
          ? simulacaoPrazo.resumo.sistemaAmortizacao
          : simulacaoPrestacao.resumo.sistemaAmortizacao,
      diferencaPrestacao:
        Math.round(
          Math.abs(
            simulacaoPrazo.resumo.novaPrestacao -
              simulacaoPrestacao.resumo.novaPrestacao,
          ) * 100,
        ) / 100,
    };

    return { simulacoes, analiseComparativa };
  }
}
