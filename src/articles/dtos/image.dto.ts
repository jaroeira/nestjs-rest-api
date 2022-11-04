import { Expose } from "class-transformer";

export class ImageDto {
    @Expose()
    readonly name: string;
}
