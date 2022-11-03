import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { User } from '../users/user.entity';
import { ArticleImage } from './entities/article.image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Tag, User, ArticleImage]),
  ],
  providers: [
    ArticlesService,
  ],
  controllers: [ArticlesController]
})
export class ArticlesModule { }
