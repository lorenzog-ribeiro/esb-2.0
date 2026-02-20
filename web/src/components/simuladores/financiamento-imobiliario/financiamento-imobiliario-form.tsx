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
  FinanciamentoImobiliarioInput,
  FinanciamentoImobiliarioInputSchema,
} from '@/lib/schemas/financiamento-imobiliario.schema';
import {
  Loader2,
  Calculator,
  Home,
  DollarSign,
  Calendar,
  User,
  Mail,
  Wallet,
} from 'lucide-react';
import {
  formatCurrency,
  parseCurrency,
  maskCurrency,
} from '@/lib/utils/input-masks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

interface FinanciamentoImobiliarioFormProps {
  onSubmit: (data: FinanciamentoImobiliarioInput) => Promise<void>;
  isLoading?: boolean;
}

export function FinanciamentoImobiliarioForm({
  onSubmit,
  isLoading = false,
}: FinanciamentoImobiliarioFormProps) {
  const form = useForm<FinanciamentoImobiliarioInput>({
    resolver: zodResolver(FinanciamentoImobiliarioInputSchema),
    defaultValues: {
      valorImovel: 500000,
      valorEntrada: 100000,
      prazoMeses: 360,
      rendaMensal: 10000,
      nome: '',
      email: '',
      email_opt_in_simulation: true,
      email_opt_in_content: true,
    },
  });

  const valorImovel = form.watch('valorImovel');
  const valorEntrada = form.watch('valorEntrada');
  const rendaMensal = form.watch('rendaMensal');

  // Calcular valores derivados
  const valorFinanciado = valorImovel - valorEntrada;
  const percentualEntrada = valorImovel > 0 ? (valorEntrada / valorImovel) * 100 : 0;
  const percentualFinanciado = valorImovel > 0 ? (valorFinanciado / valorImovel) * 100 : 0;

  // Validações customizadas
  const entradaMuitoBaixa = percentualEntrada < 20;
  const valorFinanciadoNegativo = valorFinanciado < 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulação de Financiamento Imobiliário
        </CardTitle>
        <CardDescription>
          Preencha os dados abaixo para comparar as melhores ofertas de
          financiamento com sistema SAC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações do Imóvel */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dados do Imóvel
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valorImovel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Valor do Imóvel
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="R$ 500.000,00"
                          value={field.value ? formatCurrency(field.value) : ''}
                          onChange={(e) => {
                            const masked = maskCurrency(e.target.value);
                            const numericValue = parseCurrency(masked);
                            field.onChange(numericValue);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Valor total do imóvel</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valorEntrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Valor da Entrada
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="R$ 100.000,00"
                          value={field.value ? formatCurrency(field.value) : ''}
                          onChange={(e) => {
                            const masked = maskCurrency(e.target.value);
                            const numericValue = parseCurrency(masked);
                            field.onChange(numericValue);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor pago como entrada
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Resumo do Financiamento */}
              {/* {valorImovel > 0 && !valorFinanciadoNegativo && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Valor a Financiar</p>
                      <p className="font-bold text-lg text-blue-700">
                        {formatCurrency(valorFinanciado)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {percentualFinanciado.toFixed(1)}% do imóvel
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Entrada</p>
                      <p className="font-bold text-lg text-green-700">
                        {formatCurrency(valorEntrada)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {percentualEntrada.toFixed(1)}% do imóvel
                      </p>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Alertas de Validação */}
              {valorFinanciadoNegativo && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    A entrada não pode ser maior que o valor do imóvel
                  </AlertDescription>
                </Alert>
              )}

              {entradaMuitoBaixa && !valorFinanciadoNegativo && valorImovel > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Entrada abaixo de 20% pode resultar em taxas mais altas. Considere
                    aumentar o valor da entrada para obter melhores condições.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Dados do Financiamento */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Condições do Financiamento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prazoMeses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Prazo em Meses
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="360"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Período de pagamento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rendaMensal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Renda Mensal
                      </FormLabel>
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
                        Qual é a sua renda familiar bruta?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados Pessoais
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
                        <Input placeholder="Maria da Silva" {...field} />
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
                          placeholder="maria@example.com"
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
              disabled={isLoading || valorFinanciadoNegativo}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Simular Financiamento
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
