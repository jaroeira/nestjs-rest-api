import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { configService } from '../config/config.service';
import { ApiImageFile } from '../shared/decorators/api-file.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Serialize } from '../shared/interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ArticlesService } from './articles.service';
import { ArticleToReturnDto } from './dtos/article-to-return.dto';
import { CreateArticleDto } from './dtos/create-article.dto';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { ParseFile } from '../shared/pipes/parse-file.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';
import { PageOptionsDto } from '../shared/dtos/pagination/page-options.dto';
import { PaginatedArticlesDto } from './dtos/paginated-articles.dto';
import { CreatedArticleToReturnDto } from './dtos/created-article-to-return.dto';


@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {

    constructor(private articlesService: ArticlesService) { }

    @Serialize(PaginatedArticlesDto)
    @Get()
    getArticles(@Query() pageOptionsDto: PageOptionsDto, @Query('tag') tag?: string) {
        return this.articlesService.getPaginatedArticles(pageOptionsDto, tag);
    }

    @Serialize(ArticleToReturnDto)
    @Get('/:id')
    getArticlesById(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.findOneById(id);
    }

    @Serialize(CreatedArticleToReturnDto)
    @UseGuards(JwtAuthGuard)
    @Roles(Role.Admin)
    @Post()
    async createArticle(@Body() body: CreateArticleDto, @CurrentUser() user: User) {
        return this.articlesService.create(body, user);
    }


    @Serialize(ArticleToReturnDto)
    @UseGuards(JwtAuthGuard)
    @Roles(Role.Admin)
    @Put('/:id')
    async updateArticle(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateArticleDto, @CurrentUser() user: User) {
        return this.articlesService.update(id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/like-article/:id')
    async likeArticle(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
        return this.articlesService.userLikeArticle(id, user);
    }

    @Post('/upload-image/:id')
    @UseGuards(JwtAuthGuard)
    @Roles(Role.Admin)
    @ApiImageFile('image', true, configService.getArticleUploadFolder())
    uploadImage(@UploadedFile(ParseFile) file: Express.Multer.File, @Param('id', ParseIntPipe) id: number) {
        return this.articlesService.addImageToArticle(id, file.filename);
    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.Admin)
    @Delete('/:id')
    deleteArticle(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.remove(id);
    }

}
