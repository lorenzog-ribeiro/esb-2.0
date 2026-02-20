'use client';

import { useAutoIframeHeight } from '@/lib/hooks/use-auto-iframe-height';
import { useEmprestimo } from '@/lib/hooks/use-emprestimo';
import { EmprestimoForm } from '@/components/simuladores/emprestimo/emprestimo-form';
import { EmprestimoResults } from '@/components/simuladores/emprestimo/emprestimo-results';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SimuladorDeEmprestimo() {
  const { data, isLoading, error, simular } = useEmprestimo();

  // Auto-adjust iframe height whenever data changes
  useAutoIframeHeight([data]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Simulador de Empréstimo Pessoal
        </h1>
        <p className="text-gray-600">
          Compare as melhores ofertas de empréstimo do mercado e encontre a opção ideal para você
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
          <EmprestimoForm onSubmit={simular} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-7">
          {data && <EmprestimoResults resultado={data} />}
        </div>
      </div>
    </div>
  );
}