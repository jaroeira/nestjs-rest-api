import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forRoot(configService.getTypeOrmModuleConfig())
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
