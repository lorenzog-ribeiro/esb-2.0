"use client";

import type { ReactNode } from "react";
import type { SimulatorConfig } from "@/config/site";
import { Skeleton } from "@/components/ui/skeleton";

/** Props for SimulatorPageTemplate */
export interface SimulatorPageTemplateProps {
  /** Simulator config for title, description, JSON-LD */
  simulator: SimulatorConfig;
  /** Form component — stays visible (sticky on desktop) */
  form: ReactNode;
  /** Results area — shown below form */
  results: ReactNode;
  /** Loading skeleton shown while fetching */
  isLoading?: boolean;
  /** Whether results are available */
  hasResults?: boolean;
}

/**
 * Consistent layout for simulator pages: form left (sticky), results right.
 * Form remains visible after simulation. Mobile: stacked.
 */
export function SimulatorPageTemplate({
  simulator,
  form,
  results,
  isLoading = false,
  hasResults = false,
}: SimulatorPageTemplateProps) {
  return (
    <main
      id="main-content"
      className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl"
      aria-label={`Simulador: ${simulator.title}`}
    >
      <header className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          {simulator.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {simulator.description}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Form — always visible, sticky on desktop */}
        <aside
          className="lg:col-span-5 lg:sticky lg:top-24 h-fit"
          aria-label="Formulário de entrada"
        >
          <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
            {form}
          </section>
        </aside>

        {/* Results */}
        <section
          className="lg:col-span-7 space-y-6"
          aria-label="Resultados da simulação"
        >
          {isLoading && (
            <div className="space-y-4" aria-live="polite">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          )}

          {hasResults && !isLoading && <div className="space-y-6">{results}</div>}
        </section>
      </div>
    </main>
  );
}
