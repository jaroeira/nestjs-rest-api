import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { BcryptConstants } from '../constants/bcrypt/constants';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '../auth/role.enum';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { deleteAvatarImage } from '../shared/helper/file-helper';


@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private mailService: MailService
    ) { }

    async create(user: User, password: string, isAdmin: boolean = false) {


        await this.throwIfEmailIsNotAvailable(user.email);

        // if is first user ever creat as admin
        if (await (this.userRepo.count()) === 0) isAdmin = true;

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, BcryptConstants.saltRounds);

        // Create verification token to validate users email
        if (!isAdmin) {
            const verificationToken = randomBytes(30).toString('hex');
            user.verificationToken = verificationToken;
        }

        user.passwordHash = hashedPassword;

        user.role = isAdmin ? Role.Admin : Role.User;

        if (isAdmin) user.emailVerified = true;

        const newUser = await this.userRepo.save(user);

        if (!isAdmin) {
            await this.mailService.sendUserConfirmation(user);
        }

        return newUser;
    }

    async findOne(id: number) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`No user found with id ${id}`);
        }

        return user;
    }

    findOneByEmail(email: string) {
        return this.userRepo.findOneBy({ email });
    }

    findOneByResetPasswordToken(token: string) {
        return this.userRepo.findOneBy({ resetPasswordToken: token });
    }

    all(): Promise<User[]> {
        return this.userRepo.find();
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.findOne(id);

        await this.throwIfEmailIsNotAvailable(updateUserDto.email, id);

        user.email = updateUserDto.email;
        user.firstName = updateUserDto.firstName;
        user.lastName = updateUserDto.lastName;
        user.role = updateUserDto.role;
        user.emailVerified = updateUserDto.emailVerified;

        const updatedUser = await this.userRepo.save(user);
        return updatedUser;
    }

    save(user: User) {
        return this.userRepo.save(user);
    }

    async remove(id: number) {
        const user = await this.findOne(id);

        if (user.avatarImageUrl) await deleteAvatarImage(user.avatarImageUrl);

        return this.userRepo.remove(user);
    }

    async validate(email: string, password: string): Promise<User | undefined> {
        const user = await this.userRepo.findOneBy({ email });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            if (passwordMatch) return user;
        }

    }

    async verifyUserEmail(token: string) {
        const user = await this.userRepo.findOneBy({ verificationToken: token });

        if (!user) return { message: 'verification failed. invalid token' };

        user.emailVerified = true;
        user.verificationToken = null;

        await this.userRepo.save(user);

        return { message: 'email address was successfully verified' };
    }

    async changeUserPassword(id: number, newPassword: string) {
        const user = await this.findOne(id);

        const newPasswordHash = await bcrypt.hash(newPassword, BcryptConstants.saltRounds);

        user.passwordHash = newPasswordHash;
        user.passwordChanged = new Date();
        user.resetPasswordToken = null;
        const updatedUser = await this.userRepo.save(user);
        return updatedUser;
    }

    private async throwIfEmailIsNotAvailable(email: string, id?: number) {
        //Check in DataBase if email already exists
        const user = await this.userRepo.findOneBy({ email });

        if (user && (!id || user.id !== id)) {
            throw new BadRequestException('Email in use');
        }
    }

}
