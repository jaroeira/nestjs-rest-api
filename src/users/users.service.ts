import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { BcryptConstants } from '../constants/bcrypt/constants';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '../auth/role.enum';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private mailService: MailService
    ) { }

    async create(userDto: CreateUserDto, isAdmin: boolean = false) {

        await this.throwIfEmailIsNotAvailable(userDto.email);

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(userDto.password, BcryptConstants.saltRounds);

        // Create verification token to validate users email
        const verificationToken = randomBytes(30).toString('hex');

        const user = new User();
        user.email = userDto.email;
        user.passwordHash = hashedPassword;
        user.firstName = userDto.firstName;
        user.lastName = userDto.lastName;
        user.verificationToken = verificationToken;

        isAdmin ? user.role = Role.Admin : user.role = Role.User;

        const newUser = await this.userRepo.save(user);

        await this.mailService.sendUserConfirmation(user);

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

    all(): Promise<User[]> {
        return this.userRepo.find();
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.findOne(id);

        await this.throwIfEmailIsNotAvailable(updateUserDto.email, id);

        user.email = updateUserDto.email;
        const updatedUser = await this.userRepo.save(user);
        return updatedUser;
    }

    save(user: User) {
        return this.userRepo.save(user);
    }

    async remove(id: number) {
        const user = await this.findOne(id);

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
