import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { BcryptConstants } from '../constants/bcrypt/constants';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '../auth/role.enum';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private userRepo: Repository<User>) { }

    async create(userDto: CreateUserDto, isAdmin: boolean = false) {

        await this.throwIfEmailIsNotAvailable(userDto.email);

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(userDto.password, BcryptConstants.saltRounds);

        const user = new User();
        user.email = userDto.email;
        user.passwordHash = hashedPassword;
        user.firstName = userDto.firstName;
        user.lastName = userDto.lastName;

        isAdmin ? user.role = Role.Admin : user.role = Role.User;

        const newUser = await this.userRepo.save(user);

        return newUser;
    }

    async findOne(id: number) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`No user found with id ${id}`);
        }

        return user;
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
