import { WordPressPost, WordPressCategory } from '../integrations/strapi/adapters/content.adapter';

/**
 * Contrato para serviços de conteúdo (blog, páginas, mídia).
 * O código de negócio não deve saber se a fonte é WordPress ou Strapi.
 *
 * Permite trocar WordPress → Strapi sem alterar consumidores.
 */
export const CONTENT_SERVICE = 'CONTENT_SERVICE';

export interface IContentService {
  /** Posts com paginação e filtros */
  getPosts(options: {
    page?: number;
    perPage?: number;
    search?: string;
    categoryId?: number;
  }): Promise<{
    posts: WordPressPost[];
    total: number;
    totalPages: number;
  }>;

  /** Post por slug */
  getPostBySlug(slug: string): Promise<WordPressPost>;

  /** Página por slug */
  getPageBySlug(slug: string): Promise<WordPressPost>;

  /** Categorias do blog */
  getCategories(): Promise<WordPressCategory[]>;

  /** Posts por categoria (ex: "Veja também" em emails) */
  getPostsByCategory(categorySlugOrId: string | number, limit?: number): Promise<WordPressPost[]>;

  /** URL absoluta para asset (logo, imagem). Path pode ser relativo ou absoluto. */
  getAssetUrl(path: string): string;

  /** Lista de mídia (opcional - Strapi pode não expor) */
  getMedia(): Promise<Array<{ id: number; source_url: string; alt_text?: string }>>;
}
