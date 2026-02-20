'use client';
import { JurosCompostosForm } from '@/components/simuladores/juros-compostos/juros-compostos-form';
import { JurosCompostosResults } from '@/components/simuladores/juros-compostos/juros-compostos-results';
import { useJurosCompostos } from '@/lib/hooks/use-juros-compostos';
import { Skeleton } from '@/components/ui/skeleton';
import { JurosCompostosChart } from '@/components/simuladores/juros-compostos/juros-compostos-chart';
import { useAutoIframeHeight } from '@/lib/hooks/use-auto-iframe-height';

export default function JurosCompostosPage() {
    const { data, isLoading, calcular } = useJurosCompostos();

    // Auto-adjust iframe height when data or loading state changes
    useAutoIframeHeight([data, isLoading], { delay: 100 });

    return (
        <div className="container mx-auto py-4 sm:py-8 px-4 space-y-6 sm:space-y-8 max-w-7xl">
            <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    Calculadora de Juros Compostos
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Simule o crescimento do seu investimento ao longo do tempo
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="space-y-4 lg:col-span-5 lg:sticky lg:top-24 h-fit">
                    <JurosCompostosForm
                        onSubmit={async (input) => {
                            await calcular(input);
                        }}
                        isLoading={isLoading}
                    />
                </div>

                <div className="space-y-4 sm:space-y-6 lg:col-span-7">
                    {isLoading && (
                        <div className="space-y-3 sm:space-y-4">
                            <Skeleton className="h-24 sm:h-32 w-full" />
                            <Skeleton className="h-24 sm:h-32 w-full" />
                            <Skeleton className="h-48 sm:h-64 w-full" />
                        </div>
                    )}

                    {data && !isLoading && (
                        <div className="space-y-4 sm:space-y-6">
                            <JurosCompostosResults data={data} />
                            <JurosCompostosChart data={data} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}