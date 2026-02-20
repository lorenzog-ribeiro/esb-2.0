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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FinanciamentoVeiculoInput,
  FinanciamentoVeiculoInputSchema,
  TipoVeiculo,
  TIPO_VEICULO_LABELS,
} from '@/lib/schemas/financiamento-veiculo.schema';
import {
  Loader2,
  Calculator,
  Car,
  DollarSign,
  Calendar,
  Mail,
  User,
  Wallet,
} from 'lucide-react';
import {
  formatCurrency,
  parseCurrency,
  maskCurrency,
} from '@/lib/utils/input-masks';
import { useEffect } from 'react';

interface FinanciamentoVeiculoFormProps {
  onSubmit: (data: FinanciamentoVeiculoInput) => Promise<void>;
  isLoading?: boolean;
}

export function FinanciamentoVeiculoForm({
  onSubmit,
  isLoading = false,
}: FinanciamentoVeiculoFormProps) {
  const form = useForm({
    resolver: zodResolver(FinanciamentoVeiculoInputSchema),
    defaultValues: {
      valorVeiculo: 80000,
      valorEntrada: 20000,
      prazoMeses: 48,
      rendaMensal: 5000,
      tipoVeiculo: TipoVeiculo.NOVO,
      nome: '',
      email: '',
      email_opt_in_simulation: true,
      email_opt_in_content: true,
    },
  });

  const valorVeiculo = form.watch('valorVeiculo');
  const valorEntrada = form.watch('valorEntrada');

  // Validate that entrada <= valor do veículo
  useEffect(() => {
    if (valorEntrada > valorVeiculo) {
      form.setValue('valorEntrada', valorVeiculo);
    }
  }, [valorVeiculo, valorEntrada, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Simulação de Financiamento de Veículos
        </CardTitle>
        <CardDescription>
          Preencha os dados abaixo para comparar as melhores ofertas de
          financiamento de veículos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valorVeiculo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor do Veículo
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
                      Valor total do veículo que deseja financiar
                    </FormDescription>
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
                        placeholder="R$ 20.000,00"
                        value={field.value ? formatCurrency(field.value) : ''}
                        onChange={(e) => {
                          const masked = maskCurrency(e.target.value);
                          const numericValue = parseCurrency(masked);
                          field.onChange(numericValue);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Valor que irá dar de entrada (máximo: valor do veículo)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prazoMeses"
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
                          <SelectValue placeholder="Selecione o prazo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="12">12 meses</SelectItem>
                        <SelectItem value="24">24 meses</SelectItem>
                        <SelectItem value="36">36 meses</SelectItem>
                        <SelectItem value="48">48 meses</SelectItem>
                        <SelectItem value="60">60 meses</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Número de parcelas mensais
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
                        placeholder="R$ 5.000,00"
                        value={field.value ? formatCurrency(field.value) : ''}
                        onChange={(e) => {
                          const masked = maskCurrency(e.target.value);
                          const numericValue = parseCurrency(masked);
                          field.onChange(numericValue);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Sua renda mensal comprovada
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tipoVeiculo"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Tipo de Veículo
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row gap-4"
                    >
                      {Object.entries(TIPO_VEICULO_LABELS).map(
                        ([value, label]) => (
                          <FormItem
                            key={value}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={value} />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {label}
                            </FormLabel>
                          </FormItem>
                        )
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Veículos novos geralmente têm taxas menores
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
