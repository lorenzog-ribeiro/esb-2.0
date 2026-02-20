'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ComparadorAssinaturaCarroInput,
  ComparadorAssinaturaCarroInputSchema,
} from '@/lib/schemas/comparador-assinatura-carro.schema';
import {
  Loader2,
  Calculator,
  Car,
  DollarSign,
  Calendar,
  Mail,
  User,
  TrendingUp,
} from 'lucide-react';
import {
  formatCurrency,
  parseCurrency,
  maskCurrency,
} from '@/lib/utils/input-masks';
import { useEffect } from 'react';

interface ComparadorFormProps {
  onSubmit: (data: ComparadorAssinaturaCarroInput) => Promise<void>;
  isLoading?: boolean;
}

export function ComparadorForm({
  onSubmit,
  isLoading = false,
}: ComparadorFormProps) {
  const form = useForm({
    resolver: zodResolver(ComparadorAssinaturaCarroInputSchema),
    defaultValues: {
      valorVeiculo: 80000,
      entradaFinanciamento: 20000,
      prazoFinanciamentoMeses: 48,
      valorAssinaturaMensal: 2500,
      prazoAssinaturaMeses: 36,
      tempoUsoCarroMeses: 36,
      nome: '',
      email: '',
      email_opt_in_simulation: true,
      email_opt_in_content: true,
    },
  });

  const valorVeiculo = form.watch('valorVeiculo');
  const entradaFinanciamento = form.watch('entradaFinanciamento');

  // Validate that entrada <= valor do veículo
  useEffect(() => {
    if (entradaFinanciamento > valorVeiculo) {
      form.setValue('entradaFinanciamento', valorVeiculo);
    }
  }, [valorVeiculo, entradaFinanciamento, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Comparador de Aquisição de Carro
        </CardTitle>
        <CardDescription>
          Compare: Compra à vista, Financiamento e Assinatura de carro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção: Dados do Veículo */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Dados do Veículo
              </h3>
              <FormField
                control={form.control}
                name="valorVeiculo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Preço do Veículo
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="R$ 80.000,00"
                        value={field.value ? formatCurrency(field.value) : ''}
                        onChange={(e) => {
                          const masked = maskCurrency(e.target.value);
                          const numericValue = parseCurrency(masked);
                          field.onChange(numericValue);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Valor de mercado do veículo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção: Financiamento */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Opção: Financiamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="entradaFinanciamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Entrada do Financiamento
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="R$ 20.000,00"
                          value={
                            field.value ? formatCurrency(field.value) : ''
                          }
                          onChange={(e) => {
                            const masked = maskCurrency(e.target.value);
                            const numericValue = parseCurrency(masked);
                            field.onChange(numericValue);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor da entrada (máximo: preço do veículo)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prazoFinanciamentoMeses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Prazo do Financiamento
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[12, 24, 36, 48, 60].map((months) => (
                            <SelectItem key={months} value={months.toString()}>
                              {months} meses
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Prazo em meses</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Seção: Assinatura */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Opção: Assinatura
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valorAssinaturaMensal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Valor da Assinatura Mensal
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="R$ 2.500,00"
                          value={
                            field.value ? formatCurrency(field.value) : ''
                          }
                          onChange={(e) => {
                            const masked = maskCurrency(e.target.value);
                            const numericValue = parseCurrency(masked);
                            field.onChange(numericValue);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor mensal do plano de assinatura
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prazoAssinaturaMeses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Prazo da Assinatura
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[12, 24, 36, 48, 60].map((months) => (
                            <SelectItem key={months} value={months.toString()}>
                              {months} meses
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Prazo em meses</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tempo de Uso do Carro */}
            <FormField
              control={form.control}
              name="tempoUsoCarroMeses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tempo de Uso do Carro (meses)
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[12, 24, 36, 48, 60].map((months) => (
                        <SelectItem key={months} value={months.toString()}>
                          {months} meses ({(months / 12).toFixed(1)} anos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Horizonte de tempo para análise
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Seus Dados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nome Completo
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="João da Silva" {...field} />
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
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="joao@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <SimulatorEmailOptIn control={form.control} />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Comparar Opções
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
