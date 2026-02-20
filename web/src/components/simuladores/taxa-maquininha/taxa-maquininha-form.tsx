'use client';

import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SimulatorEmailOptIn } from '../shared/SimulatorEmailOptIn';
import {
  TaxaMaquininhaInput,
  TaxaMaquininhaInputSchema,
  FILTROS_LABELS,
} from '@/lib/schemas/taxa-maquininha.schema';
import {
  Loader2,
  Calculator,
  DollarSign,
  CreditCard,
  Mail,
  User,
  Filter,
} from 'lucide-react';
import { formatCurrency, parseCurrency, maskCurrency } from '@/lib/utils/input-masks';
import { listarSegmentos, SegmentoItem } from '@/lib/api/taxa-maquininha';

interface TaxaMaquininhaFormProps {
  onSubmit: (data: TaxaMaquininhaInput) => Promise<void>;
  isLoading?: boolean;
}

export function TaxaMaquininhaForm({
  onSubmit,
  isLoading = false,
}: TaxaMaquininhaFormProps) {
  const [segmentos, setSegmentos] = useState<SegmentoItem[]>([]);

  useEffect(() => {
    listarSegmentos()
      .then(setSegmentos)
      .catch(() => setSegmentos([]));
  }, []);

  const form = useForm<TaxaMaquininhaInput>({
    resolver: zodResolver(TaxaMaquininhaInputSchema),
    defaultValues: {
      venda_debito: 5000,
      venda_credito_vista: 3000,
      venda_credito_parcelado: 2000,
      numero_parcelas: 6,
      segmento: undefined,
      sem_mensalidade: false,
      aceita_cartao_tarja: false,
      sem_fio: false,
      pf: false,
      pj: false,
      imprime_recibo: false,
      wifi: false,
      quer_antecipar: false,
      n_exige_smartphone: false,
      aceita_vale_refeicao: false,
      ecommerce: false,
      nome: '',
      email: '',
      email_opt_in_simulation: true,
      email_opt_in_content: true,
      compartilharDados: true,
      origem: 'web',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulador de Taxas de Maquininha
        </CardTitle>
        <CardDescription>
          Informe seus valores mensais de venda e compare as taxas das melhores maquininhas do mercado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Seção: Valores de Venda */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Valores de Venda Mensal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="venda_debito"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venda no Débito</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="R$ 0,00"
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor total vendido no débito por mês
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venda_credito_vista"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venda no Crédito à Vista</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="R$ 0,00"
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor total vendido no crédito à vista por mês
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venda_credito_parcelado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venda no Crédito Parcelado</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="R$ 0,00"
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor total vendido no crédito parcelado por mês
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero_parcelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Parcelas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2}
                          max={12}
                          placeholder="6"
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Número médio de parcelas (2 a 12)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="segmento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Em qual setor sua empresa atua?</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === '_none' ? undefined : Number(v))}
                      value={field.value != null ? String(field.value) : '_none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um setor..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_none">Não informado</SelectItem>
                        {segmentos.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      O setor pode influenciar as taxas disponíveis para sua empresa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção: Filtros */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros (Opcional)
              </h3>
              <p className="text-sm text-gray-600">
                Selecione as características que você precisa na maquininha
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(FILTROS_LABELS).map(([key, label]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={key as keyof typeof FILTROS_LABELS}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value as boolean}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {label}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Seção: Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu nome" {...field} />
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
                        E-mail
                      </FormLabel>
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
            </div>

            <SimulatorEmailOptIn control={form.control} />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Comparar Maquininhas
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
