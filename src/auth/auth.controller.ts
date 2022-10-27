import { BadRequestException, Body, Controller, Get, Ip, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MailService } from '../mail/mail.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { AuthUserToReturnDto } from './dtos/auth-user-to-return.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshToken } from './refreshToken.entity';
import { UserSignupDto } from './dtos/userSignup.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private mailService: MailService
    ) { }

    @Serialize(AuthUserToReturnDto)
    @Post('/signup')
    async signup(@Body() body: UserSignupDto) {
        return this.authService.signupUser(body);
    }

    // @Serialize(AuthUserToReturnDto)
    @UseGuards(LocalAuthGuard)
    @Post('/signin')
    async signin(@Request() req, @Ip() ipAddress: string, @Res({ passthrough: true }) res: Response) {
        // If user was successfully validated req obj will have a user property otherwise the route will respond 401
        const { user } = req;

        //generate jwt access token
        const accessToken = this.authService.generateAccessToken(user);

        //generate jwt refresh token
        const token = this.authService.generateRefreshToken(user, ipAddress);

        // Save refreshToken on DB
        const refreshToken = new RefreshToken();
        refreshToken.refreshToken = token.refresh_token;
        refreshToken.expires = token.expirationDateTime;
        refreshToken.user = user;
        refreshToken.createdByIp = ipAddress;

        await this.authService.saveRefreshToken(refreshToken);

        //Create cookie with refresh token
        this.setRefreshTokenCookie(token, res);

        return {
            id: user.id,
            email: user.email,
            access_token: accessToken.access_token,
            access_token_expiration: accessToken.expirationDateTime,
        };
    }

    @Get('/verify-email')
    verifyEmail(@Query('token') token: string) {

        if (!token || token === '') throw new BadRequestException('invalid token');

        return this.authService.verifyUsersEmail(token);
    }

    @UseGuards(JwtRefreshAuthGuard)
    @Post('/refresh-token')
    async refreshToken(@Body() body: any, @Ip() ipAddress: string, @CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {

        const oldRefreshTokenObj: RefreshToken = body.oldRefreshToken;

        // replace old refresh token with a new one and save
        const newToken = this.authService.generateRefreshToken(user, ipAddress);
        const newRefreshTokenObj = new RefreshToken();
        newRefreshTokenObj.refreshToken = newToken.refresh_token;
        newRefreshTokenObj.expires = newToken.expirationDateTime;
        newRefreshTokenObj.createdByIp = ipAddress;
        newRefreshTokenObj.user = user;

        oldRefreshTokenObj.revoked = new Date();
        oldRefreshTokenObj.replacedByToken = newToken.refresh_token;

        await this.authService.saveRefreshToken(oldRefreshTokenObj);
        await this.authService.saveRefreshToken(newRefreshTokenObj);

        //generate new jwt access token
        const accessToken = this.authService.generateAccessToken(user);

        //Create cookie with refresh token
        this.setRefreshTokenCookie(newToken, res);

        return {
            id: user.id,
            email: user.email,
            access_token: accessToken.access_token,
            access_token_expiration: accessToken.expirationDateTime,
        };
    }

    @UseGuards(JwtRefreshAuthGuard)
    @Post('/revoke-token')
    async revokeRefreshToken(@Body() body: any) {

        const toBeRevokedRTObj: RefreshToken = body.oldRefreshToken;

        await this.authService.revokeRefreshToken(toBeRevokedRTObj);

        return {
            message: 'token successfully revoked',
        };
    }


    @Post('/forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {

        const user = await this.authService.generateResetPasswordTokenForUser(body.email);

        if (!user) return;

        await this.mailService.sendUserResetPasswordEmail(user);

        return;
    }

    @Serialize(AuthUserToReturnDto)
    @Post('/reset-password')
    resetPassword(@Query('token') token: string, @Body() body: ResetPasswordDto) {

        if (!token) throw new BadRequestException('token is required');

        return this.authService.resetUserPassword(token, body.newPassword);
    }

    private setRefreshTokenCookie(refreshToken: { refresh_token: string, expirationDateTime: Date }, res: Response) {

        const cookieOptions = {
            httpOnly: true,
            expires: refreshToken.expirationDateTime
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);
    }


}
