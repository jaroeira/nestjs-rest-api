import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { configService } from '../config/config.service';

@Injectable()
export class MailService {

    constructor(private mailerService: MailerService) { }

    async sendUserConfirmation(user: User) {

        const confirmUrl = `${configService.getValue('API_HOST_URL')}/auth/verify-email?token=${user.verificationToken}`;

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Nestjs REST API - Verification E-Mail',
            template: './confirmation',
            context: {
                name: user.firstName,
                confirmUrl
            }
        });
    }
}
