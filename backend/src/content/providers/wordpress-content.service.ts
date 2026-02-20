import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { IContentService } from '../content.interface';
import {
  WordPressPost,
  WordPressCategory,
} from '../../integrations/strapi/adapters/content.adapter';

/**
 * Implementação de IContentService para WordPress.
 * Nenhuma URL do WordPress fica em código de negócio fora deste arquivo.
 */
@Injectable()
export class WordPressContentService implements IContentService {
  private readonly logger = new Logger(WordPressContentService.name);
  private readonly baseUrl: string;
  private readonly apiBase: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiUrl = this.configService.get<string>('WORDPRESS_API_URL');
    this.baseUrl =
      this.configService.get<string>('WORDPRESS_BASE_URL') ||
      (apiUrl ? apiUrl.replace(/\/wp-json\/wp\/v2.*$/, '') : '') ||
      'https://educandoseubolso.blog.br';
    this.apiBase = apiUrl || `${this.baseUrl}/wp-json/wp/v2`;
    this.logger.log(`WordPress content base: ${this.baseUrl}`);
  }

  async getPosts(options: {
    page?: number;
    perPage?: number;
    search?: string;
    categoryId?: number;
  }): Promise<{
    posts: WordPressPost[];
    total: number;
    totalPages: number;
  }> {
    const perPage = options.perPage && options.perPage > 0 ? options.perPage : 10;
    const page = options.page && options.page > 0 ? options.page : 1;

    const params: Record<string, any> = {
      _embed: true,
      per_page: perPage,
      page,
    };
    if (options.search) params.search = options.search;
    if (options.categoryId && options.categoryId > 0) params.categories = options.categoryId;

    const res = await this.request<WordPressPost[]>('/posts', params);
    const totalPages = parseInt((res.headers['x-wp-totalpages'] as string) || '1', 10);
    const total = parseInt((res.headers['x-wp-total'] as string) || '0', 10);

    return { posts: res.data || [], totalPages, total };
  }

  async getPostBySlug(slug: string): Promise<WordPressPost> {
    const res = await this.request<WordPressPost[]>('/posts', { slug, _embed: true });
    const post = res.data?.[0];
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getPageBySlug(slug: string): Promise<WordPressPost> {
    const res = await this.request<WordPressPost[]>('/pages', { slug, _embed: true });
    const page = res.data?.[0];
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async getCategories(): Promise<WordPressCategory[]> {
    const res = await this.request<WordPressCategory[]>('/categories', { per_page: 100 });
    const banned = new Set([
      'teste_ad', 'sem categoria', 'sem-categoria', 'uncategorized', 'ads', 'ad',
      'advertising', 'anuncio',
    ]);
    return (res.data || []).filter((c: any) => {
      const name = String(c?.name || '').toLowerCase().trim();
      const slug = String(c?.slug || '').toLowerCase().trim();
      const count = Number(c?.count || 0);
      if (count <= 0) return false;
      if (banned.has(name) || banned.has(slug)) return false;
      return true;
    });
  }

  async getPostsByCategory(
    categorySlugOrId: string | number,
    limit = 5,
  ): Promise<WordPressPost[]> {
    const params: Record<string, any> = {
      _embed: true,
      per_page: limit,
    };

    if (typeof categorySlugOrId === 'number') {
      params.categories = categorySlugOrId;
    } else {
      const cats = await this.getCategories();
      const cat = cats.find((c) => c.slug === categorySlugOrId);
      if (cat) params.categories = cat.id;
    }

    const res = await this.request<WordPressPost[]>('/posts', params);
    return res.data || [];
  }

  getAssetUrl(path: string): string {
    if (!path || path.trim() === '') return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = this.baseUrl.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    if (p.includes('wp-content')) return `${base}${p}`;
    return `${base}/wp-content/uploads${p.startsWith('/') ? '' : '/'}${p}`;
  }

  async getMedia(): Promise<Array<{ id: number; source_url: string; alt_text?: string }>> {
    const res = await this.request<any[]>('/media');
    return (res.data || []).map((m) => ({
      id: m.id,
      source_url: m.source_url || m.guid?.rendered || '',
      alt_text: m.alt_text || '',
    }));
  }

  private async request<T = any>(
    path: string,
    params?: Record<string, any>,
  ): Promise<AxiosResponse<T>> {
    const url = `${this.apiBase}${path}`;
    let attempts = 0;
    let lastError: any;

    while (attempts < 2) {
      attempts++;
      try {
        const response = await lastValueFrom(
          this.http.get<T>(url, { params, timeout: 5000, validateStatus: () => true }),
        );
        if (response.status >= 400) {
          this.logger.warn(`WordPress ${response.status} for ${url}`);
          if (response.status === 404) throw new NotFoundException(`Not found: ${path}`);
          throw new Error(`WordPress ${response.status}`);
        }
        return response;
      } catch (error) {
        lastError = error;
        const axiosError = error as AxiosError;
        if (axiosError.code || (axiosError.response?.status && axiosError.response.status >= 500)) {
          if (attempts < 2) continue;
        }
        if (error instanceof NotFoundException) throw error;
        throw lastError;
      }
    }
    throw lastError;
  }
}
