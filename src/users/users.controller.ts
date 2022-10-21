import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ChangeUserPasswordDto } from './dtos/change-user-password.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';

@Serialize(UserDto)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @Get()
    findAllUsers() {
        return this.userService.all();
    }

    @Get('/:id')
    findUser(@Param('id') id: string) {
        const userId = parseInt(id);
        if (Number.isNaN(userId)) return new BadRequestException('id must be a number');

        return this.userService.findOne(userId);
    }


    @Post()
    createUser(@Body() body: CreateUserDto) {
        return this.userService.create(body);
    }


    @Put('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        const userId = parseInt(id);
        if (Number.isNaN(userId)) return new BadRequestException('id must be a number');

        return this.userService.update(userId, body);
    }


    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        const userId = parseInt(id);
        if (Number.isNaN(userId)) return new BadRequestException('id must be a number');

        return this.userService.remove(userId);
    }


    @Post('/change-password')
    async changeUsersPassword(@Body() body: ChangeUserPasswordDto) {
        const updatedUser = await this.userService.changeUserPassword(body.id, body.newPassword);

        return updatedUser;
    }

}
