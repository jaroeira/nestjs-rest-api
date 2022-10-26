import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { configService } from '../../config/config.service';
import { UsersService } from "../../users/users.service";
import { Request as RequestType } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {

    constructor(
        private usersService: UsersService,
        private authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                JwtRefreshTokenStrategy.extractJWT
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.getValue('JWT_REFRESH_TOKEN_SECRET'),
            passReqToCallback: true
        });
    }

    private static extractJWT(req: RequestType): string | null {

        if (req.cookies && 'refreshToken' in req.cookies
            && req.cookies.refreshToken.refresh_token
            && req.cookies.refreshToken.refresh_token.length > 0
        ) {
            return req.cookies.refreshToken.refresh_token;
        }

        return null;
    }

    async validate(req: RequestType, payload: any) {

        const token = req.cookies.refreshToken.refresh_token;

        const refreshToken = await this.authService.isRefreshTokenValid(token);

        req.body['oldRefreshToken'] = refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException();
        }

        const user = await this.usersService.findOne(+payload.sub);

        if (!user) {
            throw new UnauthorizedException();
        }

        return { id: payload.sub, email: payload.email, role: user.role };

    }

}