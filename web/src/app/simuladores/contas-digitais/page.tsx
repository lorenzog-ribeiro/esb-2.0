'use client';

import { useAutoIframeHeight } from '@/lib/hooks/use-auto-iframe-height';
import { useContasDigitais } from '@/lib/hooks/use-contas-digitais';
import { ContasDigitaisForm } from '@/components/simuladores/contas-digitais/contas-digitais-form';
import { ContasDigitaisResults } from '@/components/simuladores/contas-digitais/contas-digitais-results';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SimuladorDeContasDigitais() {
  const { data, isLoading, error, simular } = useContasDigitais();

  // Auto-adjust iframe height whenever data changes
  useAutoIframeHeight([data]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Comparador de Contas Digitais
        </h1>
        <p className="text-gray-600">
          Compare contas digitais e encontre a opção mais econômica com base no
          seu perfil de uso e necessidades
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
          <ContasDigitaisForm onSubmit={simular} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-7">
          {data && <ContasDigitaisResults resultado={data} />}
        </div>
      </div>
    </div>
  );
}
