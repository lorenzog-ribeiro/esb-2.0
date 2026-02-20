/**
 * Site-wide configuration for Educando Seu Bolso.
 * Single source of truth for navigation, simuladores, rankings, and metadata.
 */

import type { LucideIcon } from "lucide-react";
import {
  BarChart2,
  Newspaper,
  Calculator,
  Users,
  CreditCard,
  Shield,
  Ticket,
  Building2,
  Car,
  TrendingUp,
  Home,
  Fuel,
  DollarSign,
} from "lucide-react";

/** Navigation link configuration */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Path prefix to match for active state (e.g. "/rankings" matches /rankings/maquinas-cartao) */
  activePrefix?: string;
}

/** Simulator metadata for hub and JSON-LD */
export interface SimulatorConfig {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: "available" | "coming_soon";
  features: readonly string[];
  /** FAQ items for AEO (perguntas frequentes) */
  faqs?: readonly { question: string; answer: string }[];
}

/** Ranking metadata for hub and navigation */
export interface RankingConfig {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  href: string;
  icon: LucideIcon;
  count: number;
  /** Tailwind classes for icon container */
  iconColor?: string;
  iconBg?: string;
}

/** Social platform config */
export interface SocialLink {
  name: string;
  href: string;
  /** Lucide or react-icons identifier */
  iconKey: "twitter" | "facebook" | "instagram" | "linkedin" | "youtube";
}

/** Contact info for footer and JSON-LD */
export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

/** Main navigation items (Header priority order: Simuladores, Rankings, Blog, Autores) */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/simuladores",
    label: "Simuladores",
    icon: Calculator,
    activePrefix: "/simuladores",
  },
  {
    href: "/rankings",
    label: "Rankings",
    icon: BarChart2,
    activePrefix: "/rankings",
  },
  {
    href: "/blog",
    label: "Blog",
    icon: Newspaper,
    activePrefix: "/blog",
  },
  {
    href: "/autores",
    label: "Autores",
    icon: Users,
    activePrefix: "/autores",
  },
] as const;

/** Simulators list — single source for hub page and footer shortcuts */
export const SIMULATORS: readonly SimulatorConfig[] = [
  {
    id: "juros-compostos",
    title: "Calculadora de Juros Compostos",
    description: "Calcule os juros compostos de forma gratuita",
    href: "/simuladores/juros-compostos",
    icon: TrendingUp,
    status: "available",
    features: ["Aporte Mensal", "Evolução", "Gráficos", "Projeções"],
    faqs: [
      {
        question: "Como funcionam os juros compostos?",
        answer:
          "Os juros compostos são calculados sobre o valor inicial mais os juros acumulados anteriormente. Com o tempo, o crescimento se acelera exponencialmente.",
      },
      {
        question: "Qual a diferença entre juros simples e compostos?",
        answer:
          "Juros simples incidem apenas sobre o capital inicial. Juros compostos incidem sobre o capital inicial mais os juros já ganhos, gerando o chamado 'efeito bola de neve'.",
      },
    ],
  },
  {
    id: "taxa-maquininha",
    title: "Simulador de Máquinas de Cartão",
    description: "Descubra a maquininha ideal para o seu negócio",
    href: "/simuladores/taxa-maquininha",
    icon: CreditCard,
    status: "available",
    features: ["Taxas", "Volume", "Recebimento", "Economia"],
    faqs: [
      {
        question: "Como calcular o custo de uma maquininha de cartão?",
        answer:
          "O custo depende das taxas percentuais (débito e crédito), taxas fixas por transação, aluguel ou valor do equipamento e volume mensal de vendas.",
      },
    ],
  },
  {
    id: "amortizacao",
    title: "Simulador de Amortização",
    description: "É melhor amortizar por prazo ou parcela",
    href: "/simuladores/amortizacao",
    icon: Calculator,
    status: "available",
    features: ["Prazo vs Parcela", "Economia", "Comparativo", "Recomendação"],
    faqs: [
      {
        question: "Como funciona a taxa TR na amortização?",
        answer:
          "A TR (Taxa Referencial) é usada para corrigir saldos devedores em financiamentos pelo Sistema de Amortização Constante (SAC). Ela varia conforme o BC e impacta o valor das parcelas.",
      },
      {
        question: "É melhor amortizar reduzindo o prazo ou a parcela?",
        answer:
          "Depende da sua situação. Reduzir o prazo diminui o total de juros pagos. Reduzir a parcela melhora o fluxo de caixa mensal. Compare ambas as opções no simulador.",
      },
    ],
  },
  {
    id: "contas-digitais",
    title: "Simulador de Contas Digitais",
    description: "Descubra a conta digital ideal para a sua necessidade",
    href: "/simuladores/contas-digitais",
    icon: Building2,
    status: "available",
    features: ["Gratuidade", "Benefícios", "Reviews", "Pontuação"],
  },
  {
    id: "comparador-maquininha",
    title: "Comparador de Maquininha de Cartão",
    description: "Compare as várias máquinas do mercado",
    href: "/simuladores/comparador-maquininha",
    icon: CreditCard,
    status: "available",
    features: ["Comparativo", "Taxas", "Funcionalidades", "Custo"],
  },
  {
    id: "aposentadoria-privada",
    title: "Simulador de Aposentadoria Privada",
    description: "Veja quanto precisa poupar para ter tranquilidade",
    href: "/simuladores/aposentadoria-privada",
    icon: Users,
    status: "available",
    features: ["Previdência", "Expectativa", "Meta de Renda", "Projeções"],
  },
  {
    id: "emprestimo",
    title: "Simulador de Empréstimo",
    description: "Descubra a melhor opção de empréstimo para você",
    href: "/simuladores/emprestimo",
    icon: DollarSign,
    status: "available",
    features: ["Múltiplas Modalidades", "Comparativo", "Cronograma", "Economia"],
  },
  {
    id: "renda-fixa",
    title: "Simulador de Investimentos em Renda Fixa",
    description: "Simule investimentos em renda fixa",
    href: "/simuladores/renda-fixa",
    icon: TrendingUp,
    status: "available",
    features: ["Renda Fixa", "Tributação", "Comparativo", "Rentabilidade"],
    faqs: [
      {
        question: "Como calcular a rentabilidade líquida de um CDB?",
        answer:
          "O CDB paga IR regressivo (22,5% a 15% conforme o prazo). A rentabilidade líquida é igual à bruta menos o IR sobre os ganhos.",
      },
    ],
  },
  {
    id: "financiamento-imobiliario",
    title: "Simulador de Financiamento Imobiliário",
    description: "Veja quanto vai pagar pela sua casa própria",
    href: "/simuladores/financiamento-imobiliario",
    icon: Home,
    status: "available",
    features: ["SAC vs PRICE", "Amortização", "Gráficos", "Planilha"],
    faqs: [
      {
        question: "Qual a diferença entre SAC e Tabela Price?",
        answer:
          "No SAC, as parcelas diminuem ao longo do tempo. Na Price, as parcelas são fixas. O SAC geralmente resulta em menos juros totais.",
      },
    ],
  },
  {
    id: "financiamento-veiculos",
    title: "Simulador de Financiamento de Veículos",
    description: "Descubra quanto vai pagar pelo seu carro",
    href: "/simuladores/financiamento-veiculos",
    icon: Car,
    status: "available",
    features: ["Novo/Usado", "Amortização", "Taxas", "Entrada"],
  },
  {
    id: "combustivel",
    title: "Simulador de Combustível",
    description: "Gasolina ou etanol?",
    href: "/simuladores/combustivel",
    icon: Fuel,
    status: "available",
    features: ["Flex", "Economia", "Consumo", "Comparativo"],
    faqs: [
      {
        question: "Quando vale a pena usar etanol?",
        answer:
          "Regra prática: se o preço do etanol for inferior a 70% do preço da gasolina, o etanol tende a compensar no abastecimento de carros flex.",
      },
    ],
  },
  {
    id: "comparador-assinatura",
    title: "Comparador de Carros por Assinatura",
    description: "Descubra qual a melhor opção entre comprar ou alugar um veículo",
    href: "/simuladores/comparador-assinatura",
    icon: Car,
    status: "available",
    features: ["Custo Total", "Break-even", "Assinatura", "Recomendação"],
  },
] as const;

/** Rankings list — single source for hub and footer */
export const RANKINGS: readonly RankingConfig[] = [
  {
    id: "maquinas-cartao",
    title: "Maquininhas de Cartão",
    shortTitle: "Máquinas de cartão",
    description:
      "As melhores maquininhas classificadas por taxas, transparência e funcionalidades",
    href: "/rankings/maquinas-cartao",
    icon: CreditCard,
    count: 10,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "seguros",
    title: "Seguros de Automóvel",
    shortTitle: "Seguros",
    description: "Ranking das seguradoras por preço, cobertura e atendimento",
    href: "/rankings/seguros",
    icon: Shield,
    count: 10,
    iconColor: "text-primary",
    iconBg: "bg-accent/10 dark:bg-accent/20",
  },
  {
    id: "pedagios",
    title: "Tags de Pedágio",
    shortTitle: "Pedágios",
    description: "Comparação de operadoras de pedágio por taxas e conveniência",
    href: "/rankings/pedagios",
    icon: Ticket,
    count: 5,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    id: "contas-digitais",
    title: "Contas Digitais",
    shortTitle: "Contas digitais",
    description: "Bancos digitais classificados por serviços, tarifas e benefícios",
    href: "/rankings/contas-digitais",
    icon: Building2,
    count: 5,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50 dark:bg-orange-950",
  },
  {
    id: "assinatura-carro",
    title: "Assinatura de Carro",
    shortTitle: "Carro por assinatura",
    description: "Serviços de assinatura de veículos por custo-benefício",
    href: "/rankings/assinatura-carro",
    icon: Car,
    count: 5,
    iconColor: "text-red-600",
    iconBg: "bg-red-50 dark:bg-red-950",
  },
] as const;

/** Footer shortcuts — simuladores e rankings em destaque */
export const FOOTER_SIMULATOR_LINKS = [
  SIMULATORS.find((s) => s.id === "amortizacao")!,
  SIMULATORS.find((s) => s.id === "renda-fixa")!,
  SIMULATORS.find((s) => s.id === "comparador-assinatura")!,
] as const;

export const FOOTER_RANKING_LINKS = [
  RANKINGS.find((r) => r.id === "maquinas-cartao")!,
  RANKINGS.find((r) => r.id === "contas-digitais")!,
  RANKINGS.find((r) => r.id === "assinatura-carro")!,
] as const;

/** Social links for footer and Organization JSON-LD */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { name: "Twitter/X", href: "https://x.com/bolsito_", iconKey: "twitter" },
  {
    name: "Facebook",
    href: "https://www.facebook.com/people/Blog-Educando-Seu-Bolso/61554308285348/",
    iconKey: "facebook",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/educandoseubolso/",
    iconKey: "instagram",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/educandoseubolso",
    iconKey: "linkedin",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@EducandoSeuBolso",
    iconKey: "youtube",
  },
] as const;

/** Contact information */
export const CONTACT: ContactInfo = {
  email: "marketing@educandoseubolso.blog.br",
  phone: "+55 (31) 9 9918-9537",
  address: "Belo Horizonte, MG - Brasil",
};

/** Site metadata */
export const SITE = {
  url: "https://educandoseubolso.blog.br",
  name: "Educando Seu Bolso",
  tagline: "Educação financeira moderna",
  description:
    "Rankings independentes, simuladores financeiros gratuitos e análises práticas para ajudar você a economizar, investir e planejar o futuro com confiança.",
  foundingDate: "2024",
} as const;

/** Helper to get simulator config by id or href */
export function getSimulatorById(id: string): SimulatorConfig | undefined {
  return SIMULATORS.find((s) => s.id === id);
}

export function getSimulatorByHref(href: string): SimulatorConfig | undefined {
  return SIMULATORS.find((s) => s.href === href);
}
