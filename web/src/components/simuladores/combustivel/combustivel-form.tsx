import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SimulatorEmailOptIn } from '../shared/SimulatorEmailOptIn';
import { CombustivelInput, CombustivelInputSchema } from "@/lib/schemas/combustivel.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fuel, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { formatCurrency, parseCurrency, maskCurrency } from '@/lib/utils/input-masks';

interface CombustivelFormProps {
    onSubmit: (data: CombustivelInput) => Promise<void>;
    isLoading?: boolean;
}


export function CombustivelForm({ onSubmit, isLoading }: CombustivelFormProps) {
    const form = useForm<CombustivelInput>({
        resolver: zodResolver(CombustivelInputSchema),
        defaultValues: {
            precoGasolina: 5.0,
            precoEtanol: 3.5,
            consumoGasolina: 10,
            consumoEtanol: 7,
            nome: '',
            email: '',
            email_opt_in_simulation: true,
            email_opt_in_content: true,
        },
    });

    const handleSubmit = async (data: CombustivelInput) => {
        await onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    Calculadora de Combustível
                </CardTitle>
                <CardDescription>
                    Compare o custo-benefício entre gasolina e etanol
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
                                name="precoGasolina"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preço da Gasolina</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="R$ 5,00"
                                                value={field.value ? formatCurrency(field.value) : ''}
                                                onChange={(e) => {
                                                    const masked = maskCurrency(e.target.value);
                                                    const numericValue = parseCurrency(masked);
                                                    field.onChange(numericValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Preço por litro da gasolina
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="precoEtanol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preço do Etanol</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="R$ 3,50"
                                                value={field.value ? formatCurrency(field.value) : ''}
                                                onChange={(e) => {
                                                    const masked = maskCurrency(e.target.value);
                                                    const numericValue = parseCurrency(masked);
                                                    field.onChange(numericValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Preço por litro do etanol
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="consumoGasolina"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consumo da Gasolina (km/l)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="10"
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Quantos quilômetros seu veículo percorre por litro de gasolina
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="consumoEtanol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consumo do Etanol (km/l)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="7
"
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Quantos quilômetros seu veículo percorre por litro de etanol
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SimulatorEmailOptIn control={form.control} />

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Calcular
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}