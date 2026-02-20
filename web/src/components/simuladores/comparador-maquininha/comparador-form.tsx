'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
  ComparadorMaquininhaInput,
  ComparadorMaquininhaInputSchema,
  MaquininhaOpcao,
} from '@/lib/schemas/comparador-maquininha.schema';
import { buscarMaquininhasDisponiveis } from '@/lib/api/comparador-maquininha';
import {
  Loader2,
  GitCompare,
  Mail,
  User,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ComparadorFormProps {
  onSubmit: (data: ComparadorMaquininhaInput) => Promise<void>;
  isLoading?: boolean;
}

export function ComparadorForm({
  onSubmit,
  isLoading = false,
}: ComparadorFormProps) {
  const [maquininhasDisponiveis, setMaquininhasDisponiveis] = useState<
    MaquininhaOpcao[]
  >([]);
  const [isLoadingMaquininhas, setIsLoadingMaquininhas] = useState(true);
  const [errorMaquininhas, setErrorMaquininhas] = useState<string | null>(null);

  const form = useForm<ComparadorMaquininhaInput>({
    resolver: zodResolver(ComparadorMaquininhaInputSchema),
    defaultValues: {
      maquininhas_ids: [],
      nome: '',
      email: '',
      email_opt_in_simulation: true,
      email_opt_in_content: true,
      compartilharDados: true,
      origem: 'web',
    },
  });

  const selectedIds = form.watch('maquininhas_ids');

  // Buscar maquininhas disponíveis ao montar o componente
  useEffect(() => {
    const fetchMaquininhas = async () => {
      try {
        setIsLoadingMaquininhas(true);
        setErrorMaquininhas(null);
        const result = await buscarMaquininhasDisponiveis();
        setMaquininhasDisponiveis(result.maquininhas);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Erro ao carregar lista de maquininhas';
        setErrorMaquininhas(errorMessage);
        toast.error('Erro ao carregar maquininhas', {
          description: errorMessage,
        });
      } finally {
        setIsLoadingMaquininhas(false);
      }
    };

    fetchMaquininhas();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Comparador de Maquininhas
        </CardTitle>
        <CardDescription>
          Selecione as maquininhas que deseja comparar lado a lado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seleção de Maquininhas via Dropdowns */}
            <FormField
              control={form.control}
              name="maquininhas_ids"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Maquininhas para Comparar
                    </FormLabel>
                    <FormDescription>
                      Selecione de 2 a 3 maquininhas. Após cada seleção, um novo
                      campo aparecerá ao lado.
                    </FormDescription>
                  </div>

                  {/* Loading State */}
                  {isLoadingMaquininhas && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-gray-600">
                        Carregando maquininhas disponíveis...
                      </span>
                    </div>
                  )}

                  {/* Error State */}
                  {errorMaquininhas && !isLoadingMaquininhas && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMaquininhas}</AlertDescription>
                    </Alert>
                  )}

                  {/* Dropdowns sequenciais */}
                  {!isLoadingMaquininhas &&
                    !errorMaquininhas &&
                    maquininhasDisponiveis.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Dropdown 1 - sempre visível */}
                        <FormItem>
                          <FormLabel>1ª Maquininha</FormLabel>
                          <Select
                            value={
                              field.value?.[0]
                                ? String(field.value[0])
                                : undefined
                            }
                            onValueChange={(val) => {
                              const id = val ? Number(val) : undefined;
                              const next = [
                                id,
                                field.value?.[1],
                                field.value?.[2],
                              ].filter((v): v is number => v !== undefined);
                              field.onChange(next);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione a 1ª maquininha" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {maquininhasDisponiveis
                                .filter(
                                  (m) =>
                                    m.id !== field.value?.[1] &&
                                    m.id !== field.value?.[2],
                                )
                                .map((m) => (
                                  <SelectItem
                                    key={m.id}
                                    value={String(m.id)}
                                  >
                                    {m.nome} ({m.empresa})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </FormItem>

                        {/* Dropdown 2 - aparece após selecionar a 1ª */}
                        {field.value?.[0] && (
                          <FormItem>
                            <FormLabel>2ª Maquininha</FormLabel>
                            <Select
                              value={
                                field.value?.[1]
                                  ? String(field.value[1])
                                  : undefined
                              }
                              onValueChange={(val) => {
                                const id = val ? Number(val) : undefined;
                                const next = [
                                  field.value?.[0],
                                  id,
                                  field.value?.[2],
                                ].filter((v): v is number => v !== undefined);
                                field.onChange(next);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecione a 2ª maquininha" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {maquininhasDisponiveis
                                  .filter(
                                    (m) =>
                                      m.id !== field.value?.[0] &&
                                      m.id !== field.value?.[2],
                                  )
                                  .map((m) => (
                                    <SelectItem
                                      key={m.id}
                                      value={String(m.id)}
                                    >
                                      {m.nome} ({m.empresa})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}

                        {/* Dropdown 3 - aparece após selecionar a 2ª */}
                        {field.value?.[1] && (
                          <FormItem>
                            <FormLabel>3ª Maquininha</FormLabel>
                            <Select
                              value={
                                field.value?.[2]
                                  ? String(field.value[2])
                                  : 'none'
                              }
                              onValueChange={(val) => {
                                const id =
                                  val && val !== 'none' ? Number(val) : undefined;
                                const next = [
                                  field.value?.[0],
                                  field.value?.[1],
                                  id,
                                ].filter((v): v is number => v !== undefined);
                                field.onChange(next);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecione a 3ª maquininha" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">
                                  — Nenhuma (comparar apenas 2)
                                </SelectItem>
                                {maquininhasDisponiveis
                                  .filter(
                                    (m) =>
                                      m.id !== field.value?.[0] &&
                                      m.id !== field.value?.[1],
                                  )
                                  .map((m) => (
                                    <SelectItem
                                      key={m.id}
                                      value={String(m.id)}
                                    >
                                      {m.nome} ({m.empresa})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      </div>
                    )}

                  {/* Empty State */}
                  {!isLoadingMaquininhas &&
                    !errorMaquininhas &&
                    maquininhasDisponiveis.length === 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Nenhuma maquininha disponível no momento.
                        </AlertDescription>
                      </Alert>
                    )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dados Pessoais */}
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
              disabled={
                isLoading ||
                isLoadingMaquininhas ||
                selectedIds.length < 2 ||
                maquininhasDisponiveis.length === 0
              }
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparando...
                </>
              ) : (
                <>
                  <GitCompare className="mr-2 h-4 w-4" />
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
