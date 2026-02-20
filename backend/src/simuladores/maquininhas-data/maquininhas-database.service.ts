import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Maquininha } from '../taxa-maquininha/interfaces/maquininha.interface';
import { ModeloCobranca } from '../taxa-maquininha/enums/modelo-cobranca.enum';

/**
 * Carrega maquininhas do banco de dados (DATABASE_URL) via Prisma.
 * Usado por taxa-maquininha e comparador-maquininha.
 * Todos os simuladores usam exclusivamente DATABASE_URL.
 */
@Injectable()
export class MaquininhasDatabaseService {
  private readonly logger = new Logger(MaquininhasDatabaseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getMediaBase(): string {
    return (
      this.configService.get<string>('MEDIA_BASE_URL') ||
      this.configService.get<string>('LEGACY_MEDIA_BASE_URL') ||
      'https://educandoseubolso.com.br/media'
    );
  }

  /**
   * Converte taxa percentual (ex: 3.99) para decimal (0.0399)
   */
  private percentToDecimal(val: number | null | undefined): number {
    if (val == null) return 0;
    return Number(val) === 0 ? 0 : Number(val) / 100;
  }

  private mapModeloCobranca(nome: string): ModeloCobranca {
    switch (nome) {
      case 'Antecipação por Juros Simples':
        return ModeloCobranca.ANTECIPACAO_JUROS_SIMPLES;
      case 'Antecipação por Juros Compostos':
        return ModeloCobranca.ANTECIPACAO_JUROS_COMPOSTOS;
      case 'Faixa':
        return ModeloCobranca.FAIXA;
      default:
        return ModeloCobranca.TAXA_PADRAO;
    }
  }

  /**
   * Carrega todas as maquininhas ativas do banco de dados
   */
  async getMaquininhasAtivas(): Promise<Maquininha[]> {
    try {
      this.logger.debug('Loading card machines from database');

      const mediaBase = this.getMediaBase();

      const [
        maquinas,
        marcas,
        empresas,
        planos,
        taxas,
        faixas,
        bandeiras,
        bandeirasMaq,
        formasRec,
        formasRecMaq,
        tiposConex,
        tiposConexMaq,
        cobrancas,
        tiposDias,
        planoSeg,
        segmentos,
      ] = await Promise.all([
        this.prisma.maquininhas_maquina.findMany({
          where: { ativo: true },
          orderBy: { nome: 'asc' },
        }),
        this.prisma.core_marca.findMany(),
        this.prisma.core_empresa.findMany(),
        this.prisma.maquininhas_plano.findMany({ where: { ativo: true } }),
        this.prisma.maquininhas_taxa.findMany({
          orderBy: [{ idPlano_id: 'asc' }, { parcela: 'asc' }],
        }),
        this.prisma.maquininhas_faixafaturamento.findMany({
          orderBy: [{ idPlano_id: 'asc' }, { minimo: 'asc' }],
        }),
        this.prisma.maquininhas_bandeira.findMany(),
        this.prisma.maquininhas_maquina_bandeiras.findMany(),
        this.prisma.maquininhas_formarecebimento.findMany(),
        this.prisma.maquininhas_maquina_forma_recebimento.findMany(),
        this.prisma.maquininhas_tipoconexao.findMany(),
        this.prisma.maquininhas_maquina_tipo_conexao.findMany(),
        this.prisma.maquininhas_cobranca.findMany(),
        this.prisma.maquininhas_tipodiascredito.findMany(),
        this.prisma.maquininhas_plano_seg.findMany(),
        this.prisma.maquininhas_segmento.findMany(),
      ]);

      const marcaMap = new Map(marcas.map((m) => [m.id, m]));
      const empresaMap = new Map(empresas.map((e) => [e.id, e.cnpj]));
      const cobrancaMap = new Map(cobrancas.map((c) => [c.id, c.nome]));
      const tipoDiasMap = new Map(
        tiposDias.map((t) => [t.id, { id: t.id, tipo: t.tipo }]),
      );
      const bandeiraMap = new Map(
        bandeiras.map((b) => [
          b.id,
          {
            nome: b.nome,
            classeCss: b.classe_css,
            imagem: b.imagem ? `${mediaBase}/${b.imagem}` : undefined,
          },
        ]),
      );
      const formaRecMap = new Map(
        formasRec.map((f) => [f.id, { nome: f.nome }]),
      );
      const tipoConexMap = new Map(
        tiposConex.map((t) => [t.id, { nome: t.nome }]),
      );
      const segmentoMap = new Map(
        segmentos.map((s) => [
          s.id,
          { id: s.id, nome: s.nome, ativo: s.ativo },
        ]),
      );

      const taxasByPlano = new Map<number, { parcela: number; taxa: number }[]>();
      for (const t of taxas) {
        const pid = t.idPlano_id;
        if (!taxasByPlano.has(pid)) taxasByPlano.set(pid, []);
        taxasByPlano.get(pid)!.push({
          parcela: t.parcela,
          taxa: this.percentToDecimal(Number(t.taxa)),
        });
      }

      const faixasByPlano = new Map<
        number,
        {
          valor: number;
          minimo: number;
          maximo: number;
          taxa_credito: number;
          taxa_credito_p: number;
          taxa_credito_p2: number;
        }[]
      >();
      for (const f of faixas) {
        const pid = f.idPlano_id;
        if (!faixasByPlano.has(pid)) faixasByPlano.set(pid, []);
        faixasByPlano.get(pid)!.push({
          valor: Number(f.valor),
          minimo: Number(f.minimo),
          maximo: Number(f.maximo),
          taxa_credito: this.percentToDecimal(Number(f.taxa_credito)),
          taxa_credito_p: this.percentToDecimal(Number(f.taxa_credito_p)),
          taxa_credito_p2: this.percentToDecimal(Number(f.taxa_credito_p2)),
        });
      }

      const bandeirasByMaq = new Map<
        number,
        { nome: string; classeCss?: string; imagem?: string }[]
      >();
      for (const bm of bandeirasMaq) {
        const b = bandeiraMap.get(bm.bandeira_id);
        if (b) {
          if (!bandeirasByMaq.has(bm.maquina_id))
            bandeirasByMaq.set(bm.maquina_id, []);
          bandeirasByMaq.get(bm.maquina_id)!.push(b);
        }
      }

      const formasByMaq = new Map<number, { nome: string }[]>();
      for (const fm of formasRecMaq) {
        const f = formaRecMap.get(fm.formarecebimento_id);
        if (f) {
          if (!formasByMaq.has(fm.maquina_id))
            formasByMaq.set(fm.maquina_id, []);
          formasByMaq.get(fm.maquina_id)!.push(f);
        }
      }

      const conexoesByMaq = new Map<number, { nome: string }[]>();
      for (const tc of tiposConexMaq) {
        const t = tipoConexMap.get(tc.tipoconexao_id);
        if (t) {
          if (!conexoesByMaq.has(tc.maquina_id))
            conexoesByMaq.set(tc.maquina_id, []);
          conexoesByMaq.get(tc.maquina_id)!.push(t);
        }
      }

      const segmentosByPlano = new Map<number, number[]>();
      for (const ps of planoSeg) {
        if (!segmentosByPlano.has(ps.plano_id))
          segmentosByPlano.set(ps.plano_id, []);
        segmentosByPlano.get(ps.plano_id)!.push(ps.segmento_id);
      }

      const planosByMaq = new Map<number, Maquininha['planos']>();
      for (const p of planos) {
        const mid = p.maquina_id;
        const cobrancaNome = cobrancaMap.get(p.modelo_cobranca_id) || '';
        const tipoDias =
          tipoDiasMap.get(p.tipo_dias_credito_id) ||
          ({ id: 1, tipo: 'CORRIDOS' } as { id: number; tipo: string });
        const segIds = segmentosByPlano.get(p.id) || [];
        const segs = segIds
          .map((id) => segmentoMap.get(id))
          .filter(Boolean) as Maquininha['planos'][0]['segmentos'];

        const faixasPlan = faixasByPlano.get(p.id) || [];
        const tipoFaixa = p.tipo_faixa ?? 1;
        const faixasConvertidas =
          tipoFaixa === 1
            ? faixasPlan
            : faixasPlan.map((f) => ({
                ...f,
                valor: this.percentToDecimal(f.valor),
              }));

        const plano: Maquininha['planos'][0] = {
          id: p.id,
          nome: p.nome,
          ativo: p.ativo,
          taxa_desconto_debito: this.percentToDecimal(
            Number(p.taxa_desconto_debito),
          ),
          taxa_desconto_credito_vista: this.percentToDecimal(
            Number(p.taxa_desconto_credito_vista),
          ),
          taxa_adicional_parcela: this.percentToDecimal(
            Number(p.taxa_adicional_parcela),
          ),
          dias_repasse_debito: p.dias_repasse_debito,
          dias_repasse_credito: p.dias_repasse_credito,
          dias_repasse_credito_parc: p.dias_repasse_credito_parc,
          tipo_dias_credito: tipoDias,
          tipo_recebimento_parcelado: p.tipo_recebimento_parcelado,
          modelo_cobranca: this.mapModeloCobranca(cobrancaNome),
          antecipado: p.antecipado,
          tipo_faixa: tipoFaixa,
          faixa_faturamento: faixasConvertidas,
          taxa_valor_excedente: Number(p.taxa_valor_excedente),
          taxas: taxasByPlano.get(p.id) || [],
          segmentos: segs,
          avaliacao: Number(p.avaliacao),
          url: p.url,
          grupo: p.grupo,
        };

        if (!planosByMaq.has(mid)) planosByMaq.set(mid, []);
        planosByMaq.get(mid)!.push(plano);
      }

      const result: Maquininha[] = [];
      for (const m of maquinas) {
        const marca = marcaMap.get(m.empresa_id);
        if (!marca) continue;
        const cnpj = empresaMap.get(marca.empresa_id) || '';

        const maq: Maquininha = {
          id: m.id,
          nome: m.nome,
          ativo: m.ativo,
          empresa: {
            id: marca.id,
            nome: marca.nome,
            cnpj,
            logo: marca.logo ? `${mediaBase}/${marca.logo}` : '',
            parceiro: marca.parceiro,
          },
          valor_leitor: Number(m.valor_leitor),
          valor_promocional: m.valor_promocional != null ? Number(m.valor_promocional) : null,
          valor_mensalidade: Number(m.valor_mensalidade),
          valor_transacao: Number(m.valor_transacao),
          possibilidade_parcelamento: m.possibilidade_parcelamento ?? 12,
          mensalidade_condicional: m.mensalidade_condicional,
          minimo_sem_mensalidade:
            m.minimo_sem_mensalidade != null
              ? Number(m.minimo_sem_mensalidade)
              : null,
          taxa_condicional: m.taxa_condicional,
          minimo_sem_taxa:
            m.minimo_sem_taxa != null ? Number(m.minimo_sem_taxa) : null,
          taxa: m.taxa != null ? Number(m.taxa) : null,
          chip: m.chip,
          tarja: m.tarja,
          NFC: m.NFC,
          fio: m.fio,
          imprime_recibo: m.imprime_recibo,
          precisa_de_telefone: m.precisa_de_telefone,
          email_recibo: m.email_recibo,
          sms_recibo: m.sms_recibo,
          possivel_antecipacao: m.possivel_antecipacao,
          opcao_ecommerce: m.opcao_ecommerce,
          taxas_transparentes: m.taxas_transparentes,
          vale_refeicao: m.vale_refeicao,
          afiliacao_a_banco: m.afiliacao_a_banco,
          sem_mensalidade: m.sem_mensalidade,
          PF: m.PF,
          PJ: m.PJ,
          garantia: m.garantia,
          planos: planosByMaq.get(m.id) || [],
          bandeiras: bandeirasByMaq.get(m.id) || [],
          tipo_conexao: conexoesByMaq.get(m.id) || [],
          forma_recebimento: formasByMaq.get(m.id) || [],
          transparencia: m.transparencia,
          url_avaliacao: m.url_avaliacao,
          observacao: m.observacao,
          imagem: m.imagem ? `${mediaBase}/${m.imagem}` : '',
          cupom: m.cupom,
          atualizado_em: m.atualizado_em,
        };
        if (maq.planos.length > 0) result.push(maq);
      }

      this.logger.log(
        `Loaded ${result.length} card machines from database`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        'Failed to load card machines from database',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
