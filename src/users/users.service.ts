import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { BcryptConstants } from '../constants/bcrypt/constants';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private userRepo: Repository<User>) { }

    async create(userDto: CreateUserDto) {

        //Check in DataBase if email already exists
        if ((await this.userRepo.findBy({ email: userDto.email })).length > 0) {
            throw new BadRequestException('Email in use');
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(userDto.password, BcryptConstants.saltRounds);

        const user = new User();
        user.email = userDto.email;
        user.passwordHash = hashedPassword;

        const newUser = await this.userRepo.save(user);

        return newUser;
    }

    all(): Promise<User[]> {
        return this.userRepo.find();
    }

}
