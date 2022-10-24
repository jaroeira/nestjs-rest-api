import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';


@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User])
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [
    UsersService
  ],
})
export class UsersModule { }
