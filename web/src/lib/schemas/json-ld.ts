/**
 * JSON-LD schema generators for SEO/AEO.
 * Schemas follow schema.org spec for rich results and AI answer engines.
 */

import { SITE } from "@/config/site";
import type { SimulatorConfig } from "@/config/site";

/** SoftwareApplication schema for simulators — helps AEO index calculators */
export function createSoftwareApplicationSchema(
  simulator: SimulatorConfig,
  options?: { featureList?: string[] }
): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: simulator.title,
    description: simulator.description,
    url: `${SITE.url}${simulator.href}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    ...(options?.featureList &&
      options.featureList.length > 0 && {
        featureList: options.featureList,
      }),
    author: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
  };
}

/** WebApplication + HowTo for calculators (alternative) */
export function createCalculatorSchema(
  simulator: SimulatorConfig,
  stepDescriptions?: string[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: simulator.title,
    description: simulator.description,
    url: `${SITE.url}${simulator.href}`,
    applicationCategory: "FinanceApplication",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    ...(stepDescriptions &&
      stepDescriptions.length > 0 && {
        step: stepDescriptions.map((desc, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text: desc,
        })),
      }),
  };
}

/** FAQPage schema for AEO featured snippets */
export function createFAQPageSchema(
  faqs: readonly { question: string; answer: string }[],
  pageUrl: string
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    url: `${SITE.url}${pageUrl}`,
  };
}
