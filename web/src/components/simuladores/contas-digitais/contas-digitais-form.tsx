'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { SimulatorEmailOptIn } from '../shared/SimulatorEmailOptIn';
import {
  ContasDigitaisFisicaInput,
  ContasDigitaisJuridicaInput,
  ContasDigitaisFisicaInputSchema,
  ContasDigitaisJuridicaInputSchema,
  TipoPessoa,
  TIPO_PESSOA_LABELS,
} from '@/lib/schemas/contas-digitais.schema';
import {
  Loader2,
  Calculator,
  User,
  Wallet,
  CreditCard,
  Mail,
  Building2,
  ArrowDownUp,
  Landmark,
  PiggyBank,
  Receipt,
  Smartphone,
  Users,
} from 'lucide-react';
import { formatCurrency, parseCurrency, maskCurrency } from '@/lib/utils/input-masks';

interface ContasDigitaisFormProps {
  onSubmit: (
    data: ContasDigitaisFisicaInput | ContasDigitaisJuridicaInput,
  ) => Promise<void>;
  isLoading?: boolean;
}

export function ContasDigitaisForm({
  onSubmit,
  isLoading = false,
}: ContasDigitaisFormProps) {
  const formFisica = useForm<ContasDigitaisFisicaInput>({
    resolver: zodResolver(ContasDigitaisFisicaInputSchema),
    defaultValues: {
      tipoPessoa: TipoPessoa.FISICA,
      temConta: false,
      tarifa: 0,
      saques: 2,
      nDocs: 0,
      nTeds: 5,
      nDepositos: 1,
      credito: true,
      debito: true,
      investimentos: false,
      transferencias: true,
      depCheque: false,
      nome: '',
      email: '',
      email_opt_in_simulation: true,
      email_opt_in_content: true,
    },
  });

  const formJuridica = useForm<ContasDigitaisJuridicaInput>({
    resolver: zodResolver(ContasDigitaisJuridicaInputSchema),
    defaultValues: {
      tipoPessoa: TipoPessoa.JURIDICA,
      temConta: false,
      tarifa: 0,
      saques: 3,
      nDocs: 0,
      nTeds: 10,
      boletos: 20,
      maquininha: false,
      folhaPagamento: false,
      debito: true,
      cartaoVirtual: true,
      nome: '',
      email: '',
      email_opt_in_simulation: true,
      email_opt_in_content: true,
    },
  });

  const [tipoPessoa, setTipoPessoa] = React.useState<TipoPessoa>(
    TipoPessoa.FISICA,
  );

  const form = (tipoPessoa === TipoPessoa.FISICA
    ? formFisica
    : formJuridica) as UseFormReturn<any>;
  const isPF = tipoPessoa === TipoPessoa.FISICA;

  const handleTipoPessoaChange = (value: string) => {
    setTipoPessoa(value as TipoPessoa);
  };

  const temConta = form.watch('temConta' as const) as boolean;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Comparador de Contas Digitais
        </CardTitle>
        <CardDescription>
          Compare contas digitais e encontre a opção mais econômica para o seu
          perfil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de Pessoa */}
            <div className="space-y-3">
              <FormLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Tipo de Pessoa
              </FormLabel>
              <RadioGroup
                onValueChange={handleTipoPessoaChange}
                defaultValue={tipoPessoa}
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
            </div>

            {/* Já possui conta digital? */}
            <FormField
              control={form.control}
              name="temConta"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Já possuo uma conta digital</FormLabel>
                    <FormDescription>
                      Marque se você já possui uma conta e quer comparar com
                      outras opções
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Tarifa mensal atual */}
            {temConta && (
              <FormField
                control={form.control}
                name="tarifa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Tarifa Mensal Atual
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        {...field}
                        value={
                          field.value ? formatCurrency(field.value) : 'R$ 0,00'
                        }
                        onChange={(e) => {
                          const masked = maskCurrency(e.target.value);
                          field.onChange(parseCurrency(masked));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Quanto você paga mensalmente na sua conta atual
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Transações mensais */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ArrowDownUp className="h-4 w-4" />
                Uso Mensal de Transações
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Saques */}
                <FormField
                  control={form.control}
                  name="saques"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saques por mês</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DOCs */}
                <FormField
                  control={form.control}
                  name="nDocs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOCs por mês</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TEDs/PIX */}
                <FormField
                  control={form.control}
                  name="nTeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TEDs/PIX por mês</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Depósitos (apenas PF) */}
                {isPF && (
                  <FormField
                    control={form.control}
                    name="nDepositos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depósitos por mês</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Boletos (apenas PJ) */}
                {!isPF && (
                  <FormField
                    control={form.control}
                    name="boletos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Boletos emitidos por mês</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Funcionalidades desejadas */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Funcionalidades Desejadas
              </h3>

              <div className="space-y-3">
                {/* Pessoa Física */}
                {isPF && (
                  <>
                    <FormField
                      control={form.control}
                      name="credito"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <CreditCard className="h-3 w-3" />
                              Cartão de Crédito
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="debito"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <CreditCard className="h-3 w-3" />
                              Cartão de Débito
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="investimentos"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <PiggyBank className="h-3 w-3" />
                              Investimentos
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transferencias"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <ArrowDownUp className="h-3 w-3" />
                              Recebe Transferências (TED/DOC)
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="depCheque"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <Smartphone className="h-3 w-3" />
                              Depósito de Cheque por Imagem
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Pessoa Jurídica */}
                {!isPF && (
                  <>
                    <FormField
                      control={form.control}
                      name="debito"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <CreditCard className="h-3 w-3" />
                              Cartão de Débito
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cartaoVirtual"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <CreditCard className="h-3 w-3" />
                              Cartão Virtual
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maquininha"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <Receipt className="h-3 w-3" />
                              Maquininha de Cartão Inclusa
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="folhaPagamento"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              Folha de Pagamento
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Dados pessoais */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
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
                        <Input placeholder="Digite seu nome completo" {...field} />
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

              <SimulatorEmailOptIn control={form.control} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparando contas...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Comparar Contas Digitais
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
