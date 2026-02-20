'use client';

import { useAutoIframeHeight } from '@/lib/hooks/use-auto-iframe-height';
import { useTaxaMaquininha } from '@/lib/hooks/use-taxa-maquininha';
import { TaxaMaquininhaForm } from '@/components/simuladores/taxa-maquininha/taxa-maquininha-form';
import { TaxaMaquininhaResults } from '@/components/simuladores/taxa-maquininha/taxa-maquininha-results';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SimuladorTaxaMaquininha() {
  const { data, isLoading, error, simular } = useTaxaMaquininha();

  // Auto-adjust iframe height whenever data changes
  useAutoIframeHeight([data]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Simulador de Taxas de Maquininha de Cartão
        </h1>
        <p className="text-gray-600">
          Compare as melhores maquininhas do mercado e descubra qual tem o menor custo mensal para o seu negócio
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
          <TaxaMaquininhaForm onSubmit={simular} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-7">
          {data && <TaxaMaquininhaResults resultado={data} />}
        </div>
      </div>
    </div>
  );
}
