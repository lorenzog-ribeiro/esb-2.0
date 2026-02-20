/**
 * Segmentos/setores de atuação para o simulador de taxas de maquininha
 *
 * Sincronizado com o modelo Segmento do Django (maquininhas.models.Segmento).
 * Para atualizar com dados do banco legado:
 *
 * python manage.py shell
 * from maquininhas.models import Segmento
 * list(Segmento.objects.filter(ativo=True).values_list('id', 'nome').order_by('nome'))
 */
export interface SegmentoItem {
  id: number;
  nome: string;
}

export const SEGMENTOS: SegmentoItem[] = [
  { id: 1, nome: 'Alimentação (restaurantes, lanchonetes)' },
  { id: 2, nome: 'Comércio varejista' },
  { id: 3, nome: 'Educação (escolas, universidades, cursos)' },
  { id: 4, nome: 'Saúde (clínicas, consultórios)' },
  { id: 5, nome: 'Beleza e estética' },
  { id: 6, nome: 'Serviços gerais' },
  { id: 7, nome: 'Transporte e mobilidade' },
  { id: 8, nome: 'Imobiliário' },
  { id: 9, nome: 'Eventos e turismo' },
  { id: 10, nome: 'Outros' },
];
