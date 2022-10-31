import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";


export class UpdateArticleDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsString()
    content: string;

    @IsArray()
    @IsString({ each: true })
    tags: string[];
}