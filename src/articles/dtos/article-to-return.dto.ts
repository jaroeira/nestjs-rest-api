import { Expose, Transform, Type } from "class-transformer";
import { User } from "src/users/user.entity";


class LikesDto {
    readonly likedBy: User[];
}

class TagsDto {
    @Expose()
    @Transform(obj => 'tag')
    readonly tagName: string;
}

class UserDto {
    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;
}
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
    @Type(() => UserDto)
    Author: UserDto;
}
