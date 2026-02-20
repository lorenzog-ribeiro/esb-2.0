"use client";

import { createFAQPageSchema } from "@/lib/schemas/json-ld";

/** Single FAQ item */
export interface FAQItem {
  question: string;
  answer: string;
}

/** Props for FAQSection */
export interface FAQSectionProps {
  /** FAQ items — used for FAQPage JSON-LD when pageUrl provided */
  items: readonly FAQItem[];
  /** Page URL for JSON-LD (e.g. /simuladores/amortizacao) */
  pageUrl?: string;
  /** Section title */
  title?: string;
  /** Additional class names */
  className?: string;
}

export function FAQSection({
  items,
  pageUrl,
  title = "Perguntas Frequentes",
  className = "",
}: FAQSectionProps) {
  if (items.length === 0) return null;

  const faqSchema = pageUrl ? createFAQPageSchema(items, pageUrl) : null;

  return (
    <section
      className={`space-y-6 ${className}`}
      aria-labelledby="faq-heading"
    >
      {faqSchema && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <h2
        id="faq-heading"
        className="text-xl sm:text-2xl font-bold text-foreground"
      >
        {title}
      </h2>
      <dl className="space-y-6">
        {items.map((item, i) => (
          <div
            key={`${item.question}-${i}`}
            className="border-b border-border pb-4 last:border-0"
          >
            <dt className="text-base font-semibold text-foreground mb-2">
              {item.question}
            </dt>
            <dd className="text-muted-foreground leading-relaxed">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
