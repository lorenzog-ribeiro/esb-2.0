import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  BlogCategoryDto,
  BlogMediaDto,
  BlogPostListResponseDto,
} from './dto/blog-response.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { ContentService } from '../content/content.service';

/**
 * BlogService - Consumidor de IContentService.
 * Não conhece WordPress nem Strapi; usa apenas ContentService.
 */
@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private readonly contentService: ContentService) {}

  async getPosts(options: GetPostsQueryDto): Promise<BlogPostListResponseDto> {
    try {
      const result = await this.contentService.getPosts(options);
      return {
        posts: result.posts,
        totalPosts: result.total,
        totalPages: result.totalPages,
      };
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.BAD_REQUEST) {
        return { posts: [], totalPages: 1, totalPosts: 0 };
      }
      throw error;
    }
  }

  async getPostBySlug(slug: string) {
    return this.contentService.getPostBySlug(slug);
  }

  async getPageBySlug(slug: string) {
    return this.contentService.getPageBySlug(slug);
  }

  async getCategories(): Promise<BlogCategoryDto[]> {
    const categories = await this.contentService.getCategories();
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      count: c.count,
      link: c.link,
    }));
  }

  async getMedia(): Promise<BlogMediaDto[]> {
    const media = await this.contentService.getMedia();
    return media.map((m) => ({
      id: m.id,
      source_url: m.source_url,
      alt_text: m.alt_text || '',
    }));
  }
}
