import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @Serialize(UserDto)
    @Get()
    findAllUsers() {
        return this.userService.all();
    }

    @Serialize(UserDto)
    @Get('/:id')
    findUser(@Param('id') id: string) {
        const userId = parseInt(id);
        if (Number.isNaN(userId)) return new BadRequestException('id must be a number');

        return this.userService.findOne(userId);
    }

    @Serialize(UserDto)
    @Post()
    createUser(@Body() body: CreateUserDto) {
        return this.userService.create(body);
    }

    @Serialize(UserDto)
    @Put('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        const userId = parseInt(id);
        if (Number.isNaN(userId)) return new BadRequestException('id must be a number');

        return this.userService.update(userId, body);
    }

    @Serialize(UserDto)
    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        const userId = parseInt(id);
        if (Number.isNaN(userId)) return new BadRequestException('id must be a number');

        return this.userService.remove(userId);
    }

}
