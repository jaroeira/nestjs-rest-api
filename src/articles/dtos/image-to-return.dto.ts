import { Expose, Type } from "class-transformer";


class ArticleDto {
    @Expose()
    id: number;
}

export class ImageToReturnDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    createdAt: Date;

    @Expose()
    @Type(() => ArticleDto)
    article: ArticleDto;

}