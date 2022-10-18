import { IsNumber, IsString } from "class-validator";


export class ChangeUserPasswordDto {
    @IsNumber()
    id: number;

    @IsString()
    newPassword: string;
}