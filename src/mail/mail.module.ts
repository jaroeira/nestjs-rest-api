import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { configService } from '../config/config.service';

@Module({
    imports: [
        MailerModule.forRoot(configService.getMailerConfig())
    ],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule { }
