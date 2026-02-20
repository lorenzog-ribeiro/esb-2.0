import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { StrapiModule } from '../integrations/strapi/strapi.module';
import { ContentService } from './content.service';
import { CommentService } from './comment.service';
import { CONTENT_SERVICE, IContentService } from './content.interface';
import { WordPressContentService } from './providers/wordpress-content.service';
import { StrapiContentService } from './providers/strapi-content.service';

@Module({
  imports: [
    HttpModule.register({ timeout: 5000 }),
    StrapiModule,
  ],
  providers: [
    ContentService,
    CommentService,
    {
      provide: CONTENT_SERVICE,
      useFactory: (
        configService: ConfigService,
        wordPress: WordPressContentService,
        strapi: StrapiContentService,
      ): IContentService => {
        const useStrapi = configService.get<string>('USE_STRAPI') === 'true';
        return useStrapi ? strapi : wordPress;
      },
      inject: [ConfigService, WordPressContentService, StrapiContentService],
    },
    WordPressContentService,
    StrapiContentService,
  ],
  exports: [ContentService, CommentService, CONTENT_SERVICE],
})
export class ContentModule {}
