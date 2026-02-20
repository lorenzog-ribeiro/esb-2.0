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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulatorEmailOptIn } from '../shared/SimulatorEmailOptIn';
import { JurosCompostosInput, JurosCompostosInputSchema } from '@/lib/schemas/juros-compostos.schema';
import { Calculator, TrendingUp } from 'lucide-react';
import { formatCurrency, parseCurrency, maskCurrency, formatPercentage, parsePercentage, maskPercentage } from '@/lib/utils/input-masks';

interface JurosCompostosFormProps {
    onSubmit: (data: JurosCompostosInput) => Promise<void>;
    isLoading?: boolean;
}

export function JurosCompostosForm({ onSubmit, isLoading }: JurosCompostosFormProps) {
    const form = useForm<JurosCompostosInput>({
        resolver: zodResolver(JurosCompostosInputSchema),
        defaultValues: {
            valorInicial: 10000,
            aporteMensal: 500,
            tempoAplicacao: 3,
            tempoAplicacaoUnidade: 'anos',
            taxaJuros: 11,
            nome: '',
            email: '',
            email_opt_in_simulation: true,
            email_opt_in_content: true,
        },
    });

    const handleSubmit = async (data: JurosCompostosInput) => {
        await onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Calculadora de Juros Compostos
                </CardTitle>
                <CardDescription>
                    Simule o crescimento do seu investimento com aportes mensais
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="valorInicial"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Inicial</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="R$ 10.000,00"
                                                value={field.value ? formatCurrency(field.value) : ''}
                                                onChange={(e) => {
                                                    const masked = maskCurrency(e.target.value);
                                                    const numericValue = parseCurrency(masked);
                                                    field.onChange(numericValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Valor inicial do investimento
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="aporteMensal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Aporte Mensal</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="R$ 500,00"
                                                value={field.value ? formatCurrency(field.value) : ''}
                                                onChange={(e) => {
                                                    const masked = maskCurrency(e.target.value);
                                                    const numericValue = parseCurrency(masked);
                                                    field.onChange(numericValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Valor a ser investido mensalmente
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-2 md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="tempoAplicacao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tempo de Aplicação</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="3"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Período do investimento
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tempoAplicacaoUnidade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unidade de Tempo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione a unidade" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="meses">Meses</SelectItem>
                                                    <SelectItem value="anos">Anos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Unidade do período
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="taxaJuros"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Taxa de Juros Anual</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="11%"
                                                value={field.value ? `${field.value}%` : ''}
                                                onChange={(e) => {
                                                    const cleaned = e.target.value.replace(/%/g, '').replace(',', '.');
                                                    const numericValue = parseFloat(cleaned);
                                                    field.onChange(isNaN(numericValue) ? 0 : numericValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Taxa de juros anual em porcentagem
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SimulatorEmailOptIn control={form.control} />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                'Calculando...'
                            ) : (
                                <>
                                    <Calculator className="mr-2 h-4 w-4" />
                                    Calcular
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}