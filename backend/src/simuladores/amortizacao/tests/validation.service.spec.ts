import { AmortizacaoService } from '../amortizacao.service'

const prismaMock = {
  simulation: { create: jest.fn().mockResolvedValue({ id: 'mock' }) },
} as any
const emailMock = { sendSimulationResult: jest.fn() } as any
const economicRatesMock = { getTrFactor: jest.fn().mockResolvedValue(1.002) } as any

describe('AmortizacaoService validation', () => {
  it('simplified sanity: sem amortização extraordinária', async () => {
    const svc = new AmortizacaoService(prismaMock, emailMock, economicRatesMock)
    const input = {
      nome: 'Teste',
      email: 'teste@example.com',
      email_opt_in_simulation: false,
      valorFinanciamento: 300000,
      taxaJurosAnual: 12,
      prazoMeses: 360,
      parcelaAtual: 60,
      seguroMensal: 0,
      taxaAdministracao: 0,
    } as any
    const out = await svc.calcularAmortizacao(input)
    const prest = out.resumo.novaPrestacao
    const prazo = out.resumo.prazoRestante
    const saldo = out.resumo.saldoDevedor
    expect(prazo).toBe(300)
    expect(Math.abs(saldo - 300000)).toBeLessThanOrEqual(0.01)
    expect(Math.abs(prest - 3846.7)).toBeLessThanOrEqual(10)
  })
})
