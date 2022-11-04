import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageMetaDto } from '../shared/dtos/pagination/page-meta.dto';
import { PageOptionsDto } from '../shared/dtos/pagination/page-options.dto';
import { deleteArticleImage } from 'src/shared/helper/file-helper';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { ArticleImage } from './entities/article.image.entity';
import { Tag } from './entities/tag.entity';
import { PageDto } from '../shared/dtos/pagination/page.dto';

@Injectable()
export class ArticlesService {

    constructor(
        @InjectRepository(Article) private articleRepo: Repository<Article>,
        @InjectRepository(Tag) private tagRepo: Repository<Tag>,
        @InjectRepository(ArticleImage) private articleImageRepo: Repository<ArticleImage>
    ) { }

    async getPaginatedArticles(pageOptionsDto: PageOptionsDto, tag?: string) {

        let queryBuilder = this.articleRepo.createQueryBuilder('article')
            .leftJoinAndSelect('article.tags', 'tag')
            .leftJoinAndSelect('article.images', 'article_image')
            .leftJoinAndSelect('article.createdByUser', 'user')


        queryBuilder.orderBy('article.createdAt', pageOptionsDto.order)
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take)

        if (tag) queryBuilder = queryBuilder.where('tag.tagName = :tagName', { tagName: tag });

        const itemCount = await queryBuilder.getCount();
        const { entities } = await queryBuilder.getRawAndEntities();

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(entities, pageMetaDto);

    }

    async create(article: Article) {
        return this.articleRepo.save(article);
    }

    async findOneById(id: number) {

        const article = await this.articleRepo.findOne({
            where: {
                id
            },
            relations: {
                likedBy: true,
                tags: true,
                createdByUser: true,
                images: true
            }
        });

        if (!article) {
            throw new NotFoundException(`No article found with id ${id}`);
        }

        return article;
    }

    async save(article: Article) {
        return this.articleRepo.save(article);
    }

    async userLikeArticle(articleId: number, user: User) {
        const article = await this.findOneById(articleId);

        const likesOfUserOnArticle = await this.articleRepo.createQueryBuilder('article')
            .leftJoin('article.likedBy', 'user')
            .where('user.id = :userId', { userId: user.id })
            .andWhere('article.id = :articleId', { articleId: article.id })
            .getCount();

        if (likesOfUserOnArticle === 0) {
            await this.articleRepo.createQueryBuilder()
                .relation(Article, 'likedBy')
                .of(article)
                .add(user);

            return { message: 'added like to article ' + article.id };
        } else {
            await this.articleRepo.createQueryBuilder()
                .relation(Article, 'likedBy')
                .of(article)
                .remove(user);

            return { message: 'removed like to article ' + article.id };
        }

    }

    async remove(id: number) {

        const article = await this.articleRepo.findOne({
            where: {
                id
            },
            relations: {
                images: true
            }
        });

        if (!article) {
            throw new NotFoundException(`No article found with id ${id}`);
        }

        for (const image of article.images) {
            await deleteArticleImage(image.name);
        }

        return this.articleRepo.remove(article);
    }

    async addImageToArticle(id: number, filename: string) {
        const article = await this.articleRepo.findOne({
            where: {
                id
            }
        });

        if (!article) {
            await deleteArticleImage(filename);
            throw new NotFoundException(`No article found with id ${id}`);
        }


        const image = new ArticleImage();
        image.name = filename;
        image.article = article;


        return this.articleImageRepo.save(image);
    }

    async getTags(tagNamesList: string[]) {

        // Check if Tags already exist
        const tags = await this.tagRepo.createQueryBuilder('tag')
            .where('tag.tagName IN (:...tagsList)', { tagsList: [...tagNamesList] }).getMany();

        // Map [] of Tag Objects to string[]
        const fetchedTagNames = tags.map(t => t.tagName);

        // Check if any tag is missing
        const missingTagNames = tagNamesList.filter(t => !fetchedTagNames.includes(t));

        // If we have all tags return 
        if (missingTagNames.length === 0) return tags;

        //if not create the tags that are missing
        let missingTags: Tag[] = [];

        for (const tagName of missingTagNames) {
            const tag = new Tag();
            tag.tagName = tagName;

            const newTag = await this.tagRepo.save(tag);
            missingTags.push(newTag);
        }

        const allTags = [...tags, ...missingTags];

        // return all tags
        return allTags;
    }
}
