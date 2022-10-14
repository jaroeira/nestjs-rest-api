import { Body, Controller, Get, Post } from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @Serialize(UserDto)
    @Get()
    listAllUsers() {
        return this.userService.all();
    }

    @Serialize(UserDto)
    @Post()
    createUser(@Body() body: CreateUserDto) {
        return this.userService.create(body);
    }

}
