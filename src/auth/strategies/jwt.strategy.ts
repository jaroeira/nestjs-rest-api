import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from "../../users/users.service";
import { configService } from '../../config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getValue('JWT_ACCESS_TOKEN_SECRET')
        });
    }

    async validate(payload: any) {

        const user = await this.usersService.findOne(+payload.sub);

        if (!user) {
            throw new UnauthorizedException();
        }

        return { id: payload.sub, email: payload.email, role: user.role };
    }

}