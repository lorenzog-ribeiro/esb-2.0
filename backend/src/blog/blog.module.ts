import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [ConfigModule, ContentModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
