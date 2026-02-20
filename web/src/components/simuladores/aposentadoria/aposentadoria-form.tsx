'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SimulatorEmailOptIn } from '../shared/SimulatorEmailOptIn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Calculator, TrendingUp } from 'lucide-react';
import { SimularAposentadoriaInput, SimularAposentadoriaInputSchema, ModoCalculoAposentadoria } from '@/lib/schemas/aposentadoria.schema';
import { useState } from 'react';

interface AposentadoriaFormProps {
    onSubmit: (data: SimularAposentadoriaInput) => Promise<void>;
    isLoading?: boolean;
}

export function AposentadoriaForm({ onSubmit, isLoading }: AposentadoriaFormProps) {
    const [modoCalculo, setModoCalculo] = useState<ModoCalculoAposentadoria>(ModoCalculoAposentadoria.RECEBER);

    const form = useForm({
        resolver: zodResolver(SimularAposentadoriaInputSchema),
        defaultValues: {
            modoCalculo: ModoCalculoAposentadoria.RECEBER,
            idadeAtual: 28,
            idadeAposentadoria: 50,
            valorJaAcumulado: 50000,
            rendaMensalDesejada: 12000,
            contribuicaoMensal: undefined,
            incluirCenariosSaque: true,
            nome: '',
            email: '',
            email_opt_in_simulation: true,
            email_opt_in_content: true,
        },
    });

    const handleSubmit = async (data: SimularAposentadoriaInput) => {
        await onSubmit(data);
    };

    const handleModoChange = (modo: ModoCalculoAposentadoria) => {
        setModoCalculo(modo);
        form.setValue('modoCalculo', modo);

        // Limpar campos dependentes
        if (modo === ModoCalculoAposentadoria.RECEBER) {
            form.setValue('contribuicaoMensal', undefined);
        } else {
            form.setValue('rendaMensalDesejada', undefined);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Simulador de Aposentadoria Privada
                </CardTitle>
                <CardDescription>
                    Planeje sua aposentadoria e descubra quanto precisa investir
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit(handleSubmit)(e);
                        }}
                        className="space-y-6"
                    >
                        {/* Dados Pessoais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Seu nome completo"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="seu@email.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Modo de Cálculo */}
                        <FormField
                            control={form.control}
                            name="modoCalculo"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Modo de Cálculo</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => handleModoChange(value as ModoCalculoAposentadoria)}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={ModoCalculoAposentadoria.RECEBER} />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Sei quanto quero receber (calcula contribuição necessária)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={ModoCalculoAposentadoria.CONTRIBUIR} />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Sei quanto posso contribuir (calcula renda futura)
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Idade Atual */}
                            <FormField
                                control={form.control}
                                name="idadeAtual"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Idade Atual (anos)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="28"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Idade de Aposentadoria */}
                            <FormField
                                control={form.control}
                                name="idadeAposentadoria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Idade para Aposentar (anos)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="50"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Valor Já Acumulado */}
                            <FormField
                                control={form.control}
                                name="valorJaAcumulado"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Valor Já Acumulado (R$)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="R$ 50.000,00"
                                                value={(field.value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                onChange={(e) => {
                                                    const numericValue = e.target.value.replace(/\D/g, '');
                                                    field.onChange(parseFloat(numericValue) / 100 || 0);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Quanto você já tem investido em previdência privada (se houver)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Renda Mensal Desejada - Apenas modo RECEBER */}
                            {modoCalculo === ModoCalculoAposentadoria.RECEBER && (
                                <FormField
                                    control={form.control}
                                    name="rendaMensalDesejada"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Renda Mensal Desejada (R$)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="R$ 12.000,00"
                                                    value={(field.value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/\D/g, '');
                                                        field.onChange(parseFloat(numericValue) / 100 || 0);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Quanto você deseja receber mensalmente na aposentadoria
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Contribuição Mensal - Apenas modo CONTRIBUIR */}
                            {modoCalculo === ModoCalculoAposentadoria.CONTRIBUIR && (
                                <FormField
                                    control={form.control}
                                    name="contribuicaoMensal"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Contribuição Mensal (R$)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="R$ 2.000,00"
                                                    value={(field.value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/\D/g, '');
                                                        field.onChange(parseFloat(numericValue) / 100 || 0);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Quanto você pode contribuir mensalmente
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Incluir Cenários de Saque */}
                            <FormField
                                control={form.control}
                                name="incluirCenariosSaque"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Análise de Sustentabilidade</FormLabel>
                                            <FormDescription>
                                                Incluir cenários de saque sustentável no resultado
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SimulatorEmailOptIn control={form.control} />

                        <Button type="submit" disabled={isLoading} className="w-full">
                            <Calculator className="mr-2 h-4 w-4" />
                            {isLoading ? 'Calculando...' : 'Calcular Aposentadoria'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
