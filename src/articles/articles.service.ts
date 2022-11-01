import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class ArticlesService {

    constructor(
        @InjectRepository(Article) private articleRepo: Repository<Article>,
        @InjectRepository(Tag) private tagRepo: Repository<Tag>,
        @InjectRepository(User) private userRepo: Repository<User>
    ) { }

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
                createdByUser: true
            }
        });

        if (!article) {
            throw new NotFoundException(`No article found with id ${id}`);
        }



        // const likes = article.likedBy.length;

        // delete article.likedBy;
        // return { ...article, likes };

        return article;
    }

    async save(article: Article) {
        return this.articleRepo.save(article);
    }

    async userLikeArticle(articleId: number, userId: number) {
        const article = await this.findOneById(articleId);

        const user = await this.userRepo.findOne({
            where: {
                id: userId
            },
            relations: {
                likedArticles: true
            }
        })

        if (user.likedArticles.some((a: Article) => a.id === articleId)) {
            user.likedArticles = user.likedArticles.filter((a: Article) => a.id !== articleId);
        } else {
            user.likedArticles = [...user.likedArticles, article];
        }

        return this.userRepo.save(user);
    }

    async remove(id: number) {
        const article = await this.findOneById(id);
        return this.articleRepo.remove(article);
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
