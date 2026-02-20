import { Test, TestingModule } from '@nestjs/testing';
import { AmortizacaoService } from '../amortizacao.service';
import { AmortizacaoInputDto } from '../dto/amortizacao-input.dto';
import {
  SistemaAmortizacao,
  TipoAmortizacaoExtraordinaria,
} from '../enums/sistema-amortizacao.enum';
import { EconomicRatesService } from '../../../shared/economic-rates/economic-rates.service';

describe('AmortizacaoService', () => {
  let service: AmortizacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmortizacaoService,
        {
          provide: require('../../../prisma/prisma.service').PrismaService,
          useValue: { simulation: { create: jest.fn() } },
        },
        {
          provide: require('../../../email/email.service').EmailService,
          useValue: { sendSimulationResult: jest.fn() },
        },
        {
          provide: EconomicRatesService,
          useValue: { getTrFactor: jest.fn().mockResolvedValue(1.002) },
        },
      ],
    }).compile();

    service = module.get<AmortizacaoService>(AmortizacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('SAC System', () => {
    it('calculates a simplified amortization result', async () => {
      const input: AmortizacaoInputDto = {
        valorFinanciamento: 128000,
        taxaJurosAnual: 9,
        prazoMeses: 360,
        seguroMensal: 40,
        taxaAdministracao: 25,
        parcelaAtual: 28,
        amortizacoesExtraordinarias: [
          {
            valor: 22000,
            mesOcorrencia: 1,
            tipo: TipoAmortizacaoExtraordinaria.DIMINUIR_PARCELA,
          },
        ],
      } as any;

      const result = await service.calcularAmortizacao(input);

      expect(result).toBeDefined();
      expect(result.resumo).toBeDefined();
      expect(typeof result.resumo.novaPrestacao).toBe('number');
      expect(typeof result.resumo.prazoRestante).toBe('number');
      expect(typeof result.resumo.saldoDevedor).toBe('number');
    });

    it('compares two simplified scenarios', async () => {
      const input: AmortizacaoInputDto = {
        valorFinanciamento: 128000,
        taxaJurosAnual: 9,
        prazoMeses: 360,
        seguroMensal: 40,
        taxaAdministracao: 25,
        parcelaAtual: 28,
        amortizacoesExtraordinarias: [
          {
            valor: 22000,
            mesOcorrencia: 1,
            tipo: TipoAmortizacaoExtraordinaria.DIMINUIR_PARCELA,
          },
        ],
      } as any;

      const result = await service.compararSistemas(input);

      expect(result).toBeDefined();
      expect(result.simulacoes).toHaveLength(2);
      expect(result.analiseComparativa).toBeDefined();
      expect(typeof result.analiseComparativa.diferencaPrestacao).toBe(
        'number',
      );
    });
  });
});
