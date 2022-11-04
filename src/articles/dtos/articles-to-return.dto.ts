import { Expose, Type } from "class-transformer";
import { ArticleAuthorDto } from "./article-author.dto";
import { ImageDto } from "./image.dto";
import { TagsDto } from "./tags.dto";

export class ArticlesToReturnDto {
    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    content: string;

    @Expose()
    createdAt: Date;

    @Expose()
    @Type(() => TagsDto)
    tags: TagsDto;

    @Expose({ name: 'createdByUser' })
    @Type(() => ArticleAuthorDto)
    Author: ArticleAuthorDto;

    @Expose({ name: 'images' })
    @Type(() => ImageDto)
    images: ImageDto;
}