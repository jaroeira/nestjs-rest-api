import { Expose } from "class-transformer";


export class UserDto {

    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    role: string;

    @Expose()
    avatarImageUrl: string;

    @Expose()
    passwordChanged: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    createdAt: Date;
}