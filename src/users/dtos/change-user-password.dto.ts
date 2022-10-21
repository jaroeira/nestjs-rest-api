import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";


export class ChangeUserPasswordDto {
    @IsNumber()
    @ApiProperty()
    id: number;

    @IsString()
    @ApiProperty()
    newPassword: string;
}