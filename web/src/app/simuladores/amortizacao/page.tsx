"use client";

import { AmortizacaoSacChart } from "@/components/simuladores/amortizacao/amortizacao-chart";
import { AmortizacaoSacForm } from "@/components/simuladores/amortizacao/amortizacao-form";
import { AmortizacaoSacResults } from "@/components/simuladores/amortizacao/amortizacao-results";
import { SimulatorPageTemplate } from "@/components/simuladores/SimulatorPageTemplate";
import { FAQSection } from "@/components/faq/FAQSection";
import { getSimulatorById } from "@/config/site";
import { useAmortizacaoSac } from "@/lib/hooks/use-amortizacao";
import { useAutoIframeHeight } from "@/lib/hooks/use-auto-iframe-height";

const simulator = getSimulatorById("amortizacao")!;

export default function AmortizacaoSacPage() {
  const { data, isLoading, comparar } = useAmortizacaoSac();

  useAutoIframeHeight([data, isLoading], { delay: 100 });

  return (
    <SimulatorPageTemplate
      simulator={simulator}
      form={
        <AmortizacaoSacForm
          onSubmit={async (input) => {
            await comparar(input);
          }}
          isLoading={isLoading}
        />
      }
      results={
        <>
          <AmortizacaoSacResults data={data!} />
          <AmortizacaoSacChart data={data!} />
          {simulator.faqs && simulator.faqs.length > 0 && (
            <FAQSection
              items={simulator.faqs}
              pageUrl={simulator.href}
              title="Perguntas Frequentes"
            />
          )}
        </>
      }
      isLoading={isLoading}
      hasResults={!!data}
    />
  );
}
