import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dtos/create-article.dto';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { Article } from './entities/article.entity';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {

    constructor(private articlesService: ArticlesService) { }

    @Get()
    getArticles() {
        return 'Get Articles';
    }

    @Get('/:id')
    getArticlesById(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.findOneById(id,);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createArticle(@Body() body: CreateArticleDto, @CurrentUser() user: User) {

        const article = new Article();
        article.title = body.title;
        article.description = body.description;
        article.content = body.content;
        article.createdByUser = user;

        if (body.tags.length > 0) {
            const lowercasetags = body.tags.map(t => t.toLowerCase());
            const tags = await this.articlesService.getTags(lowercasetags);
            article.tags = tags;
        }

        return this.articlesService.create(article);
    }

    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async updateArticle(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateArticleDto, @CurrentUser() user: User) {
        const article = await this.articlesService.findOneById(id);

        article.title = body.title;
        article.description = body.description;
        article.content = body.content;

        if (body.tags.length > 0) {
            const lowercasetags = body.tags.map(t => t.toLowerCase().trim());
            const tags = await this.articlesService.getTags(lowercasetags);
            article.tags = tags;
        } else {
            article.tags = [];
        }



        return this.articlesService.save(article);
    }

    @Post('/like-article')
    likeArticle() {
        return 'Like Article';
    }

    @Post('/upload-image')
    uploadImage() {
        return 'upload image to article';
    }

    @Delete('/:id')
    deleteArticle(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.remove(id);
    }

}
