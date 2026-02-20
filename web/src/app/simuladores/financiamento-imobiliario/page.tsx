'use client';

import { useAutoIframeHeight } from '@/lib/hooks/use-auto-iframe-height';
import { useFinanciamentoImobiliario } from '@/lib/hooks/use-financiamento-imobiliario';
import { FinanciamentoImobiliarioForm } from '@/components/simuladores/financiamento-imobiliario/financiamento-imobiliario-form';
import { FinanciamentoImobiliarioResults } from '@/components/simuladores/financiamento-imobiliario/financiamento-imobiliario-results';
import { FinanciamentoImobiliarioOfertas } from '@/components/simuladores/financiamento-imobiliario/financiamento-imobiliario-ofertas';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Home } from 'lucide-react';

export default function FinanciamentoImobiliarioPage() {
  const { data, isLoading, error, simular } = useFinanciamentoImobiliario();

  // Auto-adjust iframe height whenever data changes
  useAutoIframeHeight([data, isLoading]);

  // Melhor oferta (menor primeira parcela)
  const melhorOferta = data
    ? [...data].sort((a, b) => a.parcelaInicial - b.parcelaInicial)[0]
    : null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Home className="h-8 w-8 text-blue-600" />
          Simulador de Financiamento Imobiliário
        </h1>
        <p className="text-gray-600">
          Compare as melhores ofertas de financiamento com taxas pós-fixadas (TR) e
          Sistema SAC - Parcelas decrescentes ao longo do tempo
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
          <FinanciamentoImobiliarioForm onSubmit={simular} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-7 space-y-6">
          {melhorOferta && (
            <>
              <FinanciamentoImobiliarioResults oferta={melhorOferta} />
              {data && data.length > 1 && (
                <FinanciamentoImobiliarioOfertas ofertas={data} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
