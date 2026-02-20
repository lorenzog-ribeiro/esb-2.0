import {
  TaxaMaquininhaInput,
  TaxaMaquininhaOutput,
  TaxaMaquininhaOutputSchema,
} from '../schemas/taxa-maquininha.schema';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export interface SegmentoItem {
  id: number;
  nome: string;
}

/**
 * Busca a lista de segmentos/setores disponíveis
 */
export async function listarSegmentos(): Promise<SegmentoItem[]> {
  const response = await fetch(`${API_BASE_URL}/simuladores/taxa-maquininha/segmentos`);
  if (!response.ok) {
    throw new Error('Erro ao carregar segmentos');
  }
  return response.json();
}

/**
 * Simula taxas de maquininhas de cartão chamando o backend
 *
 * @param data - Dados de entrada da simulação
 * @returns Resultado com todas as maquininhas calculadas
 * @throws Error se a requisição falhar
 */
export async function simularTaxaMaquininha(
  data: TaxaMaquininhaInput,
): Promise<TaxaMaquininhaOutput> {
  const response = await fetch(`${API_BASE_URL}/simuladores/taxa-maquininha/simular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Erro ao simular taxas de maquininha',
    }));
    throw new Error(error.message || 'Erro ao simular taxas de maquininha');
  }

  const result = await response.json();

  // Validar resposta com Zod
  const parsed = TaxaMaquininhaOutputSchema.safeParse(result);

  if (!parsed.success) {
    console.error('Schema validation error:', parsed.error);
    throw new Error('Formato de resposta inválido do servidor');
  }

  return parsed.data;
}
