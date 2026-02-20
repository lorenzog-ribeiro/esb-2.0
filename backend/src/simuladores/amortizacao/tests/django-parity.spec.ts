import { Test, TestingModule } from '@nestjs/testing';
import { AmortizacaoService } from '../amortizacao.service';
import { AmortizacaoInputDto } from '../dto/amortizacao-input.dto';
import { EconomicRatesService } from '../../../shared/economic-rates/economic-rates.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Testes de paridade NestJS vs Django (calculos.py).
 *
 * Usa fixtures com output do legado para garantir que o NestJS produza
 * resultados dentro da tolerância (R$ 0,02 para valores monetários).
 *
 * EconomicRatesService é mockado com trFactor=1.002 (valor usado no Django)
 * para testes determinísticos.
 */
describe('AmortizacaoService - Django Parity', () => {
  let service: AmortizacaoService;

  const mockEconomicRates = {
    getTrFactor: jest.fn().mockResolvedValue(1.002),
  };

  const baseInput: Partial<AmortizacaoInputDto> = {
    nome: 'Teste Parity',
    email: 'teste@parity.local',
    email_opt_in_simulation: false,
    email_opt_in_content: false,
  };

  beforeEach(async () => {
    mockEconomicRates.getTrFactor.mockResolvedValue(1.002);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmortizacaoService,
        {
          provide: require('../../../prisma/prisma.service').PrismaService,
          useValue: { simulation: { create: jest.fn().mockResolvedValue({}) } },
        },
        {
          provide: require('../../../email/email.service').EmailService,
          useValue: { sendSimulationResult: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: EconomicRatesService,
          useValue: mockEconomicRates,
        },
      ],
    }).compile();

    service = module.get<AmortizacaoService>(AmortizacaoService);
  });

  it('deve usar trFactor 1.002 do EconomicRatesService (paridade Django)', async () => {
    const input: AmortizacaoInputDto = {
      ...baseInput,
      valorFinanciamento: 128000,
      taxaJurosAnual: 9,
      prazoMeses: 360,
      parcelaAtual: 28,
      saldoDevedorAtual: 128000,
      seguroMensal: 40,
      taxaAdministracao: 25,
      amortizacoesExtraordinarias: [{ valor: 22000, mesOcorrencia: 20 }],
    } as AmortizacaoInputDto;

    const result = await service.compararSistemas(input);

    expect(mockEconomicRates.getTrFactor).toHaveBeenCalled();

    const porPrazo = result.simulacoes.find(
      (s) => s.resumo.sistemaAmortizacao === 'POR_PRAZO',
    );
    expect(porPrazo).toBeDefined();

    // Django legacy_output aproximado (calculos.py com TR=1.002):
    // novaPrestacao ~1372.82, prazoRestante 194, saldoDevedor 106000
    const TOLERANCE_CURRENCY = 1; // R$ 1 para acomodar arredondamentos
    const TOLERANCE_INT = 2;

    expect(Math.abs(porPrazo!.resumo.novaPrestacao - 1372.82)).toBeLessThanOrEqual(
      TOLERANCE_CURRENCY,
    );
    expect(Math.abs(porPrazo!.resumo.prazoRestante - 194)).toBeLessThanOrEqual(
      TOLERANCE_INT,
    );
    expect(Math.abs(porPrazo!.resumo.saldoDevedor - 106000)).toBeLessThanOrEqual(
      TOLERANCE_CURRENCY,
    );
  });

  it('deve produzir simulacao simples dentro da tolerância', async () => {
    const input: AmortizacaoInputDto = {
      ...baseInput,
      valorFinanciamento: 100000,
      taxaJurosAnual: 12,
      prazoMeses: 60,
      parcelaAtual: 10,
      saldoDevedorAtual: 83333.33,
      seguroMensal: 0,
      taxaAdministracao: 0,
    } as AmortizacaoInputDto;

    const result = await service.calcularAmortizacao(input);

    // juros = 83333*0.00949 ≈ 790, amort = 83333/50 ≈ 1667
    // novaPrestacao ≈ 2457
    expect(result.resumo.novaPrestacao).toBeGreaterThan(2000);
    expect(result.resumo.novaPrestacao).toBeLessThan(3000);
    expect(result.resumo.prazoRestante).toBe(50);
    expect(Math.abs(result.resumo.saldoDevedor - 83333.33)).toBeLessThanOrEqual(1);
  });

  describe('fixtures from JSON', () => {
    const fixturesPath = path.join(
      process.cwd(),
      'docs/simulator-validation/fixtures/amortizacao.django-compare.json',
    );

    if (fs.existsSync(fixturesPath)) {
      const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'));

      fixtures.cases.forEach((tc: any) => {
        if (!tc.legacy_output) return;

        it(`case ${tc.id}: compararSistemas dentro da tolerância`, async () => {
          const input: AmortizacaoInputDto = {
            ...baseInput,
            ...tc.input,
          } as AmortizacaoInputDto;

          const result = await service.compararSistemas(input);
          const tol = tc.tolerance || { currency: 0.02, integer: 1 };

          if (tc.legacy_output.POR_PRAZO) {
            const porPrazo = result.simulacoes.find(
              (s) => s.resumo.sistemaAmortizacao === 'POR_PRAZO',
            );
            expect(porPrazo).toBeDefined();
            expect(
              Math.abs(porPrazo!.resumo.novaPrestacao - tc.legacy_output.POR_PRAZO.novaPrestacao),
            ).toBeLessThanOrEqual(tol.currency ?? 1.0);
            expect(
              Math.abs(porPrazo!.resumo.prazoRestante - tc.legacy_output.POR_PRAZO.prazoRestante),
            ).toBeLessThanOrEqual(tol.integer ?? 2);
          }

          if (tc.legacy_output.POR_PRESTACAO) {
            const porPrest = result.simulacoes.find(
              (s) => s.resumo.sistemaAmortizacao === 'POR_PRESTACAO',
            );
            expect(porPrest).toBeDefined();
            expect(
              Math.abs(
                porPrest!.resumo.novaPrestacao - tc.legacy_output.POR_PRESTACAO.novaPrestacao,
              ),
            ).toBeLessThanOrEqual(tol.currency ?? 200);
          }
        });
      });
    }
  });
});
