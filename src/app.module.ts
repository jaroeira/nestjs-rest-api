import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { MailModule } from './mail/mail.module';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MailModule,
    TypeOrmModule.forRoot(configService.getTypeOrmModuleConfig()),
    ArticlesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true
      })
    },
  ],
})
export class AppModule { }
