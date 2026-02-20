import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Simulators and Rankings (e2e smoke)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /simuladores/juros-compostos should calculate successfully', async () => {
    const payload = {
      nome: 'Teste',
      email: 'teste@example.com',
      valorInicial: 10000,
      contribuicaoMensal: 500,
      taxaJurosMensal: 0.5,
      meses: 120,
    };

    const res = await request(app.getHttpServer())
      .post('/simuladores/juros-compostos')
      .send(payload)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data?.resumo?.valorTotalFinalBruto).toBeGreaterThan(0);
  });

  it('POST /simuladores/amortizacao should return simplified amortization', async () => {
    const payload = {
      nome: 'Teste',
      email: 'teste@example.com',
      valorFinanciamento: 128000,
      taxaJurosAnual: 9,
      prazoMeses: 360,
      seguroMensal: 40,
      taxaAdministracao: 25,
      parcelaAtual: 28,
      saldoDevedorAtual: 120000,
      amortizacoesExtraordinarias: [{ valor: 22000, mesOcorrencia: 28 }],
    };

    const res = await request(app.getHttpServer())
      .post('/simuladores/amortizacao')
      .send(payload)
      .expect(200);

    expect(res.body).toHaveProperty('novaPrestacao');
    expect(res.body).toHaveProperty('prazoRestante');
    expect(res.body).toHaveProperty('saldoDevedor');
  });

  it('GET /rankings/card-machines should return ranking list', async () => {
    const res = await request(app.getHttpServer())
      .get('/rankings/card-machines')
      .expect(200);

    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('GET /rankings/digital-accounts should return ranking list', async () => {
    const res = await request(app.getHttpServer())
      .get('/rankings/digital-accounts')
      .expect(200);

    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });
});
