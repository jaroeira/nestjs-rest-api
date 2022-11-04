import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ArticlesToReturnDto } from "./articles-to-return.dto";

class MetaDto {
    @ApiProperty()
    @Expose()
    page: number;

    @ApiProperty()
    @Expose()
    take: number;

    @ApiProperty()
    @Expose()
    itemCount: number;

    @ApiProperty()
    @Expose()
    pageCount: number;

    @ApiProperty()
    @Expose()
    hasPreviousPage: boolean;

    @ApiProperty()
    @Expose()
    hasNextPage: boolean;
}

export class PaginatedArticlesDto {

    @Expose()
    @Type(() => ArticlesToReturnDto)
    data: ArticlesToReturnDto[];

    @Expose()
    @Type(() => MetaDto)
    meta: MetaDto;
}