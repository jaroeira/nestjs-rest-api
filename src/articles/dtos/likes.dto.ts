import { User } from "../../users/user.entity";

export class LikesDto {
    readonly likedBy: User[];
}