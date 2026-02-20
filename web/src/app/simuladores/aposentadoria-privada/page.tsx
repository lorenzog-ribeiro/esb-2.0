'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AposentadoriaForm } from '@/components/simuladores/aposentadoria/aposentadoria-form';
import { AposentadoriaResults } from '@/components/simuladores/aposentadoria/aposentadoria-results';
import { Skeleton } from '@/components/ui/skeleton';
import { useAposentadoria } from '@/lib/hooks/use-aposentadoria';
import { useAutoIframeHeight } from '@/lib/hooks/use-auto-iframe-height';

export default function AposentadoriaPrivadaPage() {
    const { data, isLoading, simular } = useAposentadoria();
    const router = useRouter();

    // Auto-adjust iframe height when data or loading state changes
    useAutoIframeHeight([data, isLoading], { delay: 100 });

    // Clean up URL query parameters on mount and after navigation
    useEffect(() => {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.search) {
            // Remove all query parameters
            router.replace('/simuladores/aposentadoria-privada', { scroll: false });
        }
    }, [router]);

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Simulador de Aposentadoria Privada</h1>
                <p className="text-gray-600">
                    Planeje sua aposentadoria e descubra quanto precisa investir mensalmente
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
                    <AposentadoriaForm
                        onSubmit={async (input) => {
                            await simular(input);
                        }}
                        isLoading={isLoading}
                    />
                </div>

                <div className="lg:col-span-7 space-y-6">
                    {isLoading && (
                        <div className="space-y-4">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-96 w-full" />
                        </div>
                    )}

                    {data && !isLoading && (
                        <div className="space-y-6">
                            <AposentadoriaResults data={data} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
