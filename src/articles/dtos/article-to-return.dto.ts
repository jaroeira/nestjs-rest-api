import { Expose, Transform, Type } from "class-transformer";
import { ArticleAuthorDto } from "./article-author.dto";
import { ImageDto } from "./image.dto";
import { LikesDto } from "./likes.dto";
import { TagsDto } from "./tags.dto";


export class ArticleToReturnDto {
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

    @Expose({ name: 'likedBy' })
    @Type(() => LikesDto)
    @Transform(obj => obj.value.length)
    likes: LikesDto;

    @Expose({ name: 'createdByUser' })
    @Type(() => ArticleAuthorDto)
    Author: ArticleAuthorDto;

    @Expose({ name: 'images' })
    @Type(() => ImageDto)
    images: ImageDto;
}
