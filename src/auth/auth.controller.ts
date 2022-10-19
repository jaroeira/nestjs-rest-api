import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AuthUserToReturnDto } from './dtos/auth-user-to-return.dto';

@Controller('auth')
export class AuthController {

    constructor() { }

    @Serialize(AuthUserToReturnDto)
    @UseGuards(AuthGuard('local'))
    @Post('/signin')
    signin(@Request() req) {
        const { user } = req;

        return user;
    }

}
