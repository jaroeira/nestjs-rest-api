import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';

import { configService } from '../config/config.service';
import { RefreshToken } from './refreshToken.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { MailService } from 'src/mail/mail.service';



@Module({
  imports: [
    MailModule,
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.register({
      secret: configService.getValue('JWT_ACCESS_TOKEN_SECRET'),
      signOptions: {
        expiresIn: configService.getValue('JWT_ACCESS_TOKEN_EXPIRATION')
      }
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy, MailService],
  controllers: [AuthController]
})
export class AuthModule { }
