import type { Metadata } from "next";
import { getSimulatorById } from "@/config/site";
import { SimulatorJsonLd } from "@/components/seo/SimulatorJsonLd";
import { SITE } from "@/config/site";

const simulator = getSimulatorById("amortizacao")!;

export const metadata: Metadata = {
  title: simulator.title,
  description: simulator.description,
  openGraph: {
    title: `${simulator.title} | ${SITE.name}`,
    description: simulator.description,
    url: `${SITE.url}${simulator.href}`,
  },
};

export default function AmortizacaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SimulatorJsonLd simulator={simulator} />
      {children}
    </>
  );
}
