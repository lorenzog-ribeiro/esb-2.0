import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IContentService } from '../content.interface';
import { StrapiService } from '../../integrations/strapi/strapi.service';
import { WordPressPost, WordPressCategory } from '../../integrations/strapi/adapters/content.adapter';

/**
 * Implementação de IContentService para Strapi CMS.
 */
@Injectable()
export class StrapiContentService implements IContentService {
  constructor(
    private readonly strapiService: StrapiService,
    private readonly configService: ConfigService,
  ) {}

  async getPosts(options: {
    page?: number;
    perPage?: number;
    search?: string;
    categoryId?: number;
  }) {
    return this.strapiService.getPosts(options);
  }

  async getPostBySlug(slug: string): Promise<WordPressPost> {
    return this.strapiService.getPostBySlug(slug);
  }

  async getPageBySlug(slug: string): Promise<WordPressPost> {
    return this.strapiService.getPageBySlug(slug);
  }

  async getCategories(): Promise<WordPressCategory[]> {
    return this.strapiService.getCategories();
  }

  async getPostsByCategory(
    categorySlugOrId: string | number,
    limit = 5,
  ): Promise<WordPressPost[]> {
    let categoryId: number;
    if (typeof categorySlugOrId === 'number') {
      categoryId = categorySlugOrId;
    } else {
      const cats = await this.getCategories();
      const cat = cats.find((c) => c.slug === categorySlugOrId);
      if (!cat) return [];
      categoryId = cat.id;
    }
    const result = await this.strapiService.getPosts({
      categoryId,
      perPage: limit,
      page: 1,
    });
    return result.posts;
  }

  getAssetUrl(path: string): string {
    if (!path || path.trim() === '') return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const strapiUrl =
      this.configService.get<string>('STRAPI_API_URL')?.replace(/\/api$/, '') ||
      'http://localhost:1337';
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${strapiUrl}${p}`;
  }

  async getMedia(): Promise<Array<{ id: number; source_url: string; alt_text?: string }>> {
    return [];
  }
}
