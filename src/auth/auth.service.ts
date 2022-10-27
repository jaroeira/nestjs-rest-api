import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from '../users/users.service';
import { configService } from '../config/config.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './refreshToken.entity';
import { JwtTokenPayload } from './interfaces/jwt.token.payload';


@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectRepository(RefreshToken) private refrehTokenRepo: Repository<RefreshToken>
    ) { }

    validateUser(email: string, password: string): Promise<User> {
        return this.usersService.validate(email, password);
    }

    generateAccessToken(user: User) {

        const token = this.generateJwtToken(
            user,
            configService.getValue('JWT_ACCESS_TOKEN_SECRET'),
            configService.getValue('JWT_ACCESS_TOKEN_EXPIRATION')
        );

        return {
            access_token: token,
            expirationDateTime: this.convertExpirationToDate(configService.getValue('JWT_ACCESS_TOKEN_EXPIRATION'))
        };
    }

    generateRefreshToken(user: User, ipAddress: string) {
        const token = this.generateJwtToken(
            user,
            configService.getValue('JWT_REFRESH_TOKEN_SECRET'),
            configService.getValue('JWT_REFRESH_TOKEN_EXPIRATION'),
            ipAddress
        );


        return {
            refresh_token: token,
            expirationDateTime: this.convertExpirationToDate(configService.getValue('JWT_REFRESH_TOKEN_EXPIRATION'))
        };
    }

    saveRefreshToken(refreshToken: RefreshToken) {
        return this.refrehTokenRepo.save(refreshToken);
    }

    revokeRefreshToken(toBeRevokedRT: RefreshToken) {
        toBeRevokedRT.revoked = new Date();
        return this.saveRefreshToken(toBeRevokedRT);
    }

    verifyUsersEmail(token: string) {
        return this.usersService.verifyUserEmail(token);
    }

    async generateResetPasswordTokenForUser(email: string) {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) return null;

        const resetPasswordToken = this.generateJwtToken(
            user,
            configService.getValue('JWT_RESET_PASSWORD_SECRET'),
            configService.getValue('JWT_RESET_PASSWORD_TOKEN_EXPIRATION'),
        );

        user.resetPasswordToken = resetPasswordToken;

        return this.usersService.save(user);

    }

    private generateJwtToken(user: User, secret: string, expiresIn: string, createdByIp?: string) {
        const payload: JwtTokenPayload = { email: user.email, sub: user.id, role: user.role };

        if (createdByIp) payload.createdByIp = createdByIp;

        return this.jwtService.sign(payload, {
            secret,
            expiresIn
        });
    }

    async getRefreshTokenFromDB(token: string): Promise<RefreshToken> {
        const refreshToken = await this.refrehTokenRepo.findOneBy({ refreshToken: token });
        return refreshToken;
    }

    async isRefreshTokenValid(token: string): Promise<RefreshToken> {
        const refreshToken = await this.getRefreshTokenFromDB(token);

        if (!refreshToken) return null;
        if (new Date(Date.now()) >= refreshToken.expires) return null;
        if (refreshToken.revoked) return null;

        return refreshToken;
    }

    convertExpirationToDate(expiration: string) {
        const suffix = expiration[expiration.length - 1];
        const value = parseInt(expiration.substring(0, expiration.indexOf(suffix)));

        switch (suffix) {
            case 'm':
                return new Date(Date.now() + value * 60 * 1000);
            case 'd':
                return new Date(Date.now() + value * 24 * 60 * 60 * 1000);
            default:
                throw new InternalServerErrorException('invalid expiration date format');
        }
    }




}
