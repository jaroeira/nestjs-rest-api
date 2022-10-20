import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ChangeUserPasswordDto } from './dtos/change-user-password.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @UseGuards(JwtAuthGuard)
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

    @Serialize(UserDto)
    @Post('/change-password')
    async changeUsersPassword(@Body() body: ChangeUserPasswordDto) {
        const updatedUser = await this.userService.changeUserPassword(body.id, body.newPassword);

        return updatedUser;
    }

}
