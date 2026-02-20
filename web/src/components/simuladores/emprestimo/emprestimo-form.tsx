'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimulatorEmailOptIn } from '../shared/SimulatorEmailOptIn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  EmprestimoInput,
  EmprestimoInputSchema,
  TipoPessoa,
  TipoEmprego,
  TIPO_PESSOA_LABELS,
  TIPO_EMPREGO_LABELS,
} from '@/lib/schemas/emprestimo.schema';
import { Loader2, Calculator, User, Briefcase, DollarSign, Calendar, Mail, Wallet } from 'lucide-react';
import { formatCurrency, parseCurrency, maskCurrency } from '@/lib/utils/input-masks';

interface EmprestimoFormProps {
  onSubmit: (data: EmprestimoInput) => Promise<void>;
  isLoading?: boolean;
}

export function EmprestimoForm({ onSubmit, isLoading = false }: EmprestimoFormProps) {
  const form = useForm({
    resolver: zodResolver(EmprestimoInputSchema),
    defaultValues: {
      tipoPessoa: TipoPessoa.PF,
      tipoEmprego: TipoEmprego.CLT,
      valorDesejado: 10000,
      prazoMeses: 24,
      renda: undefined,
      nome: '',
      email: '',
      email_opt_in_simulation: true,
      email_opt_in_content: true,
      origem: 'web',
    },
  });

  const tipoPessoa = form.watch('tipoPessoa');
  const isPF = tipoPessoa === TipoPessoa.PF;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulação de Empréstimo Pessoal
        </CardTitle>
        <CardDescription>
          Preencha os dados abaixo para comparar as melhores ofertas de empréstimo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tipoPessoa"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Tipo de Pessoa
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {Object.entries(TIPO_PESSOA_LABELS).map(([value, label]) => (
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
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPF && (
              <FormField
                control={form.control}
                name="tipoEmprego"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Tipo de Emprego
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de emprego" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TIPO_EMPREGO_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Isso afeta as modalidades de crédito disponíveis
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valorDesejado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor Desejado
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
                    <FormDescription>Valor do empréstimo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        placeholder="24"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Número de parcelas mensais</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="renda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Renda Mensal (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="R$ 5.000,00"
                      value={field.value ? formatCurrency(field.value) : ''}
                      onChange={(e) => {
                        const masked = maskCurrency(e.target.value);
                        const numericValue = parseCurrency(masked);
                        field.onChange(numericValue || undefined);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Informar a renda permite calcular o comprometimento percentual
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
                      <Input type="email" placeholder="joao@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SimulatorEmailOptIn control={form.control} />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Simular Empréstimo
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
