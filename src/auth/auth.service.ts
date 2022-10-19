import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService) { }

    validateUser(email: string, password: string): Promise<User> {
        return this.usersService.validate(email, password);
    }

}
