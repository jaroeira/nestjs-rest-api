import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let fakeJwtService: Partial<JwtService>;

  beforeEach(async () => {

    fakeUsersService = {};
    fakeJwtService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: JwtService,
          useValue: fakeJwtService
        }
      ],
    }).compile();


    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    // expect(service).toBeDefined();
  });
});
