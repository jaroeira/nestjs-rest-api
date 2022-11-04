import { Expose } from "class-transformer";


export class ArticleAuthorDto {
    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;
}