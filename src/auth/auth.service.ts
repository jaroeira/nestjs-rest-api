import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from '../users/users.service';
import { configService } from '../config/config.service';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    validateUser(email: string, password: string): Promise<User> {
        return this.usersService.validate(email, password);
    }

    generateAccessToken(user: User) {
        const payload = { email: user.email, sub: user.id };

        return {
            id: user.id,
            email: user.email,
            access_token: this.jwtService.sign(payload),
            expiresIn: configService.getValue('JWT_ACCESS_TOKEN_EXPIRATION')
        };
    }

    verifyUsersEmail(token: string) {
        return this.usersService.verifyUserEmail(token);
    }

}
