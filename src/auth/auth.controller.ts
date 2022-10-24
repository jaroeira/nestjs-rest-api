import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { AuthUserToReturnDto } from './dtos/auth-user-to-return.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    // @Serialize(AuthUserToReturnDto)
    @UseGuards(LocalAuthGuard)
    @Post('/signin')
    signin(@Request() req) {
        // If user was successfully validated req obj will have a user property otherwise the route will respond 401
        const { user } = req;

        //generate jwt token
        return this.authService.generateAccessToken(user);
    }

    @Get('/verify-email')
    verifyEmail() {
        return 'verify email';
    }

}
