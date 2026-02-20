import { createSoftwareApplicationSchema } from "@/lib/schemas/json-ld";
import type { SimulatorConfig } from "@/config/site";

/** Renders SoftwareApplication JSON-LD for a simulator page */
export function SimulatorJsonLd({ simulator }: { simulator: SimulatorConfig }) {
  const schema = createSoftwareApplicationSchema(simulator, {
    featureList: [...simulator.features],
  });

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
