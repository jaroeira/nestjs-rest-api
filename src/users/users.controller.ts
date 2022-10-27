import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Request, ForbiddenException, ParseIntPipe } from '@nestjs/common';
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
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @ApiOperation({ summary: 'Get all users' })
    @Get()
    @Serialize(UserDto)
    findAllUsers() {
        return this.userService.all();
    }

    @Get('/:id')
    @Serialize(UserDto)
    findUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }


    @ApiOperation({ summary: 'Create a new user' })
    @Post()
    @Serialize(UserDto)
    createUser(@Body() body: CreateUserDto) {

        const user = new User();
        user.email = body.email;
        user.firstName = body.firstName;
        user.lastName = body.lastName

        return this.userService.create(user, body.password, body.isAdmin);
    }


    @ApiOperation({ summary: 'Update a user' })
    @Put('/:id')
    @Serialize(UserDto)
    updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
        return this.userService.update(id, body);
    }

    @Delete('/:id')
    @Serialize(UserDto)
    removeUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }


    @Roles(Role.Admin, Role.User)
    @Post('/change-password')
    async changeUsersPassword(@Body() body: ChangeUserPasswordDto, @CurrentUser() user: Partial<User>) {

        if (user.role !== Role.Admin && user.id !== body.id) {
            throw new ForbiddenException();
        }

        const updatedUser = await this.userService.changeUserPassword(body.id, body.newPassword);

        return { message: 'Password changed!', id: updatedUser.id, changedOn: updatedUser.passwordChanged };
    }

}
