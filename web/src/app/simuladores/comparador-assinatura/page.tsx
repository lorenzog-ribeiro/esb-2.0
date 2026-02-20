'use client';

import { useAutoIframeHeight } from '@/lib/hooks/use-auto-iframe-height';
import { useComparadorAssinaturaCarro } from '@/lib/hooks/use-comparador-assinatura-carro';
import { ComparadorForm } from '@/components/simuladores/comparador-assinatura-carro/comparador-form';
import { ComparadorComparison } from '@/components/simuladores/comparador-assinatura-carro/comparador-comparison';
import { ComparadorBreakdown } from '@/components/simuladores/comparador-assinatura-carro/comparador-breakdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import type { ComparadorAssinaturaCarroInput } from '@/lib/schemas/comparador-assinatura-carro.schema';

export default function ComparadorAssinaturaPage() {
  const { data, isLoading, error, comparar } =
    useComparadorAssinaturaCarro();

  // Auto-adjust iframe height when data changes
  useAutoIframeHeight([data, isLoading, error]);

  const handleSubmit = async (input: ComparadorAssinaturaCarroInput) => {
    await comparar(input);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Comparador de Aquisição de Carro
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Compare: Compra à vista, Financiamento e Assinatura de carro
          </p>
        </div>

        {/* Info Alert - Visible before simulation */}
        {!data && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Como funciona?</AlertTitle>
            <AlertDescription>
              Este simulador compara os custos totais de três formas de ter um
              carro: compra à vista, financiamento bancário e assinatura de
              veículo. Consideramos todos os custos (IPVA, seguro, manutenção,
              depreciação e custo de oportunidade) para mostrar qual opção é
              mais vantajosa financeiramente.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro na comparação</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form - sempre visível para permitir ajustar parâmetros */}
        <ComparadorForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Comparison Cards */}
            <ComparadorComparison resultado={data} />

            {/* Detailed Breakdown */}
            <ComparadorBreakdown
              compraVista={data.compraVista}
              financiamento={data.financiamento}
              assinatura={data.assinatura}
            />

            {/* Methodology Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Metodologia de Cálculo</AlertTitle>
              <AlertDescription>
                <div className="space-y-2 text-sm mt-2">
                  <p>
                    <strong>Compra à Vista:</strong> Considera o valor do
                    veículo, custos de manutenção, seguro, IPVA, licenciamento,
                    depreciação e custo de oportunidade do capital investido.
                  </p>
                  <p>
                    <strong>Financiamento:</strong> Inclui o valor financiado
                    com juros, entrada, custos de manutenção, seguro, IPVA,
                    licenciamento, depreciação e custo de oportunidade da
                    entrada.
                  </p>
                  <p>
                    <strong>Assinatura:</strong> Soma das mensalidades pagas no
                    período. Geralmente inclui seguro e manutenção, sem custos
                    de IPVA e licenciamento.
                  </p>
                  <p className="text-xs text-gray-600 mt-3">
                    O custo líquido considera o valor de revenda do veículo ao
                    final do período para compra e financiamento.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
