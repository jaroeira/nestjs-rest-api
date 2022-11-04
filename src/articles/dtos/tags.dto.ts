import { Expose } from "class-transformer";


export class TagsDto {
    @Expose()
    readonly tagName: string;
}