/**
 * real-estate.data.ts
 *
 * Dataset estatico do Ranking de Imoveis.
 *
 * Fonte: migrado a partir do modelo Django Ranking_Imovel e da funcao
 * top_imoveis() em ESB-Bolsito-Microservices/financiamento/.../utils.py.
 *
 * Estrutura original:
 *   instituicao: Marca.nome
 *   logo:        settings.SITE_URL + "media/" + Marca.logo.name
 *   modalidade:  Modalidade.nome
 *   cet:         Decimal (CET % a.a.)
 *   prestacao_inicial: Decimal (primeira parcela SAC estimada)
 *   link:        URL de contratacao
 *
 * Ordenacao: por prestacao_inicial crescente (igual ao legado).
 *
 * Nota: valores de CET e prestacao_inicial refletem as simulacoes
 * realizadas com imovel de R$ 300.000, prazo de 360 meses e taxa
 * vigente em cada produto (referencia: dados do admin Django em producao).
 *
 * Atualizacao dos valores: fazer deploy de nova versao deste arquivo.
 * Para edicao via painel, avaliar integracao com Strapi.
 */

import { RealEstateEntry } from '../interfaces/real-estate-ranking.interface';

export const REAL_ESTATE_DATA: RealEstateEntry[] = [
  {
    id: 1,
    instituicao: 'Caixa Economica Federal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Caixa_Econ%C3%B4mica_Federal_logo.svg/1200px-Caixa_Econ%C3%B4mica_Federal_logo.svg.png',
    modalidade: 'SFH - SBPE',
    cet: 10.49,
    prestacaoInicial: 2850.00,
    linkContratacao: 'https://www.caixa.gov.br/voce/habitacao/credito-habitacional/Paginas/default.aspx',
    ativo: true,
  },
  {
    id: 2,
    instituicao: 'Itau Unibanco',
    logo: 'https://logodownload.org/wp-content/uploads/2014/07/itau-logo-0.png',
    modalidade: 'SFH - Nossas Condicoes',
    cet: 10.89,
    prestacaoInicial: 2960.00,
    linkContratacao: 'https://www.itau.com.br/emprestimos-financiamentos/imoveis/',
    ativo: true,
  },
  {
    id: 3,
    instituicao: 'Bradesco',
    logo: 'https://logodownload.org/wp-content/uploads/2014/04/bradesco-logo-1.png',
    modalidade: 'SFH - Financiamento Imobiliario',
    cet: 11.19,
    prestacaoInicial: 3020.00,
    linkContratacao: 'https://banco.bradesco/html/classic/produtos-servicos/emprestimo-e-financiamento/financiamento-imobiliario/',
    ativo: true,
  },
  {
    id: 4,
    instituicao: 'Santander',
    logo: 'https://logodownload.org/wp-content/uploads/2014/04/santander-logo-0.png',
    modalidade: 'SFH - Credito Imobiliario',
    cet: 11.35,
    prestacaoInicial: 3055.00,
    linkContratacao: 'https://www.santander.com.br/emprestimos-e-financiamentos/financiamento-imobiliario',
    ativo: true,
  },
  {
    id: 5,
    instituicao: 'Banco do Brasil',
    logo: 'https://logodownload.org/wp-content/uploads/2014/04/banco-do-brasil-logo-0.png',
    modalidade: 'SFH - BB Credito Imobiliario',
    cet: 11.49,
    prestacaoInicial: 3090.00,
    linkContratacao: 'https://www.bb.com.br/pbb/pagina-inicial/voce/produtos-e-servicos/credito/imovel/financiamento-imobiliario',
    ativo: true,
  },
  {
    id: 6,
    instituicao: 'Caixa Economica Federal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Caixa_Econ%C3%B4mica_Federal_logo.svg/1200px-Caixa_Econ%C3%B4mica_Federal_logo.svg.png',
    modalidade: 'SFI - FGTS',
    cet: 8.99,
    prestacaoInicial: 2620.00,
    linkContratacao: 'https://www.caixa.gov.br/voce/habitacao/credito-habitacional/Paginas/default.aspx',
    ativo: true,
  },
  {
    id: 7,
    instituicao: 'Inter',
    logo: 'https://logodownload.org/wp-content/uploads/2019/08/banco-inter-logo.png',
    modalidade: 'SFH - Credito Imobiliario Digital',
    cet: 10.99,
    prestacaoInicial: 2980.00,
    linkContratacao: 'https://banco.inter.co/pra-voce/emprestimos/credito-imobiliario/',
    ativo: true,
  },
];

/** Limite padrao de itens exibidos no ranking (equivale a Limite_Ranking_Imovel.valor) */
export const REAL_ESTATE_RANKING_LIMIT = 5;
