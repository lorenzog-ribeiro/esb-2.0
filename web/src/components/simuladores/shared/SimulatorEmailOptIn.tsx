'use client';

import { Control } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

interface SimulatorEmailOptInProps {
  control: Control<any>;
  simulationFieldName?: string;
  contentFieldName?: string;
}

/**
 * Checkboxes padronizados para opt-in de email em simuladores.
 * - Receber resultado por e-mail (envio da simulação)
 * - Aceitar e-mails do Educando Seu Bolso
 * Ambos default: true. Exibidos lado a lado, cada um em caixa separada.
 */
export function SimulatorEmailOptIn({
  control,
  simulationFieldName = 'email_opt_in_simulation',
  contentFieldName = 'email_opt_in_content',
}: SimulatorEmailOptInProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-md border p-4">
        <FormField
          control={control}
          name={simulationFieldName}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Receber resultado por e-mail</FormLabel>
                <FormDescription>
                  Marque esta opção para receber os detalhes da simulação no
                  seu e-mail.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
      <div className="rounded-md border p-4">
        <FormField
          control={control}
          name={contentFieldName}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Aceito receber e-mails do Educando Seu Bolso</FormLabel>
                <FormDescription>
                  Utilizaremos para envio das newsletters semanais com dicas de
                  educação financeira.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
