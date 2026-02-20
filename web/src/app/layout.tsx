import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const SITE_URL = "https://educandoseubolso.blog.br";
const SITE_NAME = "Educando Seu Bolso";
const SITE_DESCRIPTION =
    "Rankings independentes, simuladores financeiros gratuitos e análises práticas para ajudar você a economizar, investir e planejar o futuro com confiança.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} — Educação Financeira Moderna`,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [
        "educação financeira",
        "simuladores financeiros",
        "rankings bancários",
        "juros compostos",
        "renda fixa",
        "amortização",
        "empréstimo",
        "financiamento imobiliário",
        "CDB",
        "LCI",
        "LCA",
        "maquininha de cartão",
        "contas digitais",
        "carro por assinatura",
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: SITE_URL,
        siteName: SITE_NAME,
        title: `${SITE_NAME} — Educação Financeira Moderna`,
        description: SITE_DESCRIPTION,
        images: [
            {
                url: "/bolsito_new.svg",
                width: 1200,
                height: 630,
                alt: `${SITE_NAME} — Simuladores e Rankings Financeiros`,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@bolsito_",
        creator: "@bolsito_",
        title: `${SITE_NAME} — Educação Financeira Moderna`,
        description: SITE_DESCRIPTION,
    },
    alternates: {
        canonical: SITE_URL,
    },
};

// JSON-LD: Organization schema — emitido uma vez no root, válido para todo o site
const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/bolsito_new.svg`,
    description: SITE_DESCRIPTION,
    foundingDate: "2024",
    contactPoint: {
        "@type": "ContactPoint",
        email: "marketing@educandoseubolso.blog.br",
        telephone: "+55-31-99918-9537",
        contactType: "customer service",
        areaServed: "BR",
        availableLanguage: "Portuguese",
    },
    address: {
        "@type": "PostalAddress",
        addressLocality: "Belo Horizonte",
        addressRegion: "MG",
        addressCountry: "BR",
    },
    sameAs: [
        "https://x.com/bolsito_",
        "https://www.facebook.com/people/Blog-Educando-Seu-Bolso/61554308285348/",
        "https://www.instagram.com/educandoseubolso/",
        "https://www.linkedin.com/company/educandoseubolso",
        "https://www.youtube.com/@EducandoSeuBolso",
    ],
};

// JSON-LD: WebSite schema com SearchAction para rich result de busca
const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "pt-BR",
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className={inter.variable}>
            <head>
                <script
                    type="application/ld+json"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe here
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                <script
                    type="application/ld+json"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe here
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
            </head>
            <body className="bg-background text-foreground font-sans antialiased">
                {children}
            </body>
        </html>
    );
}
