'use client';

import { useAutoIframeHeight } from '@/lib/hooks/use-auto-iframe-height';
import { useFinanciamentoVeiculo } from '@/lib/hooks/use-financiamento-veiculo';
import { FinanciamentoVeiculoForm } from '@/components/simuladores/financiamento-veiculos/financiamento-veiculo-form';
import { FinanciamentoVeiculoResults } from '@/components/simuladores/financiamento-veiculos/financiamento-veiculo-results';
import { FinanciamentoVeiculoOfertas } from '@/components/simuladores/financiamento-veiculos/financiamento-veiculo-ofertas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { FinanciamentoVeiculoInput } from '@/lib/schemas/financiamento-veiculo.schema';

export default function FinanciamentoVeiculosPage() {
  const { data, isLoading, error, simular } = useFinanciamentoVeiculo();

  // Auto-adjust iframe height when data changes
  useAutoIframeHeight([data, isLoading, error]);

  const handleSubmit = async (input: FinanciamentoVeiculoInput) => {
    await simular(input);
  };

  // Get best offer (lowest monthly payment)
  const melhorOferta = data
    ? [...data].sort((a, b) => a.parcelaMensal - b.parcelaMensal)[0]
    : null;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Simulador de Financiamento de Veículos
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Compare as melhores ofertas de financiamento de veículos novos e
            usados
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro na simulação</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form - sempre visível para permitir ajustar parâmetros */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
            <FinanciamentoVeiculoForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Results */}
          <div className="lg:col-span-7 space-y-6">
            {data && melhorOferta && (
              <>
                <FinanciamentoVeiculoResults melhorOferta={melhorOferta} />

                {/* All Offers Table */}
                {data.length > 1 && <FinanciamentoVeiculoOfertas ofertas={data} />}

                {/* Info Alert */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Informação</AlertTitle>
                  <AlertDescription>
                    Foram encontradas {data.length} ofertas de financiamento.
                    {data.length > 1
                      ? ' A melhor oferta está destacada acima.'
                      : ''}
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
