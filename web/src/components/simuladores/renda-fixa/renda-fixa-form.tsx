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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulatorEmailOptIn } from '../shared/SimulatorEmailOptIn';
import { RendaFixaInput, RendaFixaInputSchema } from '@/lib/schemas/renda-fixa.schema';
import { TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, parseCurrency, maskCurrency } from '@/lib/utils/input-masks';

interface RendaFixaFormProps {
  onSubmit: (data: RendaFixaInput) => Promise<void>;
  isLoading?: boolean;
}

export function RendaFixaForm({ onSubmit, isLoading }: RendaFixaFormProps) {
  const form = useForm<RendaFixaInput>({
    resolver: zodResolver(RendaFixaInputSchema),
    defaultValues: {
      investimentoInicial: 10000,
      prazoMeses: 24,
      nome: '',
      email: '',
      email_opt_in_simulation: true,
      email_opt_in_content: true,
    },
  });

  const handleSubmit = async (data: RendaFixaInput) => {
    await onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Simulador de Renda Fixa
        </CardTitle>
        <CardDescription>
          Compare Poupança, Tesouro Direto, LCI e CDB
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

            {/* Parâmetros do Investimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="investimentoInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investimento Inicial</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          className="pl-10"
                          placeholder="R$ 10.000,00"
                          value={field.value ? formatCurrency(field.value) : ''}
                          onChange={(e) => {
                            const masked = maskCurrency(e.target.value);
                            const numericValue = parseCurrency(masked);
                            field.onChange(numericValue);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Quanto você tem para investir agora
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prazoMeses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo (meses)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="24"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Por quanto tempo irá investir
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SimulatorEmailOptIn control={form.control} />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Calculando...' : 'Simular Investimentos'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
