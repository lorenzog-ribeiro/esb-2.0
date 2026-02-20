import { Injectable, Inject } from '@nestjs/common';
import { CONTENT_SERVICE, IContentService } from './content.interface';

@Injectable()
export class ContentService {
  constructor(
    @Inject(CONTENT_SERVICE)
    private readonly contentProvider: IContentService,
  ) {}

  async getPosts(options: {
    page?: number;
    perPage?: number;
    search?: string;
    categoryId?: number;
  }) {
    return this.contentProvider.getPosts(options);
  }

  async getPostBySlug(slug: string) {
    return this.contentProvider.getPostBySlug(slug);
  }

  async getPageBySlug(slug: string) {
    return this.contentProvider.getPageBySlug(slug);
  }

  async getCategories() {
    return this.contentProvider.getCategories();
  }

  async getPostsByCategory(categorySlugOrId: string | number, limit = 5) {
    return this.contentProvider.getPostsByCategory(categorySlugOrId, limit);
  }

  getAssetUrl(path: string): string {
    return this.contentProvider.getAssetUrl(path);
  }

  async getMedia() {
    return this.contentProvider.getMedia();
  }
}
