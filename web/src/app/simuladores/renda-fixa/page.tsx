'use client';

import { RendaFixaForm } from '@/components/simuladores/renda-fixa/renda-fixa-form';
import { RendaFixaResults } from '@/components/simuladores/renda-fixa/renda-fixa-results';
import { useRendaFixa } from '@/lib/hooks/use-renda-fixa';
import { Skeleton } from '@/components/ui/skeleton';
import { useAutoIframeHeight } from '@/lib/hooks/use-auto-iframe-height';

export default function RendaFixaPage() {
  const { data, isLoading, simular } = useRendaFixa();

  // Auto-adjust iframe height when data or loading state changes
  useAutoIframeHeight([data, isLoading], { delay: 100 });

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 space-y-6 sm:space-y-8 max-w-7xl">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Simulador de Renda Fixa
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Compare investimentos: Poupança, Tesouro Direto, LCI e CDB
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        <div className="space-y-4 lg:col-span-5 lg:sticky lg:top-24 h-fit">
          <RendaFixaForm
            onSubmit={async (input) => {
              await simular(input);
            }}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-4 sm:space-y-6 lg:col-span-7">
          {isLoading && (
            <div className="space-y-3 sm:space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          )}

          {data && !isLoading && (
            <RendaFixaResults data={data} />
          )}
        </div>
      </div>
    </div>
  );
}
