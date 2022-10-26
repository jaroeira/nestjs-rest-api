import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RefreshToken } from './refreshToken.entity';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(entity => entity),
  findOneBy: jest.fn(entity => entity),
  save: jest.fn(entity => entity),
  remove: jest.fn(entity => entity)
}));

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let fakeJwtService: Partial<JwtService>;
  let repositoryMock: MockType<Repository<RefreshToken>>;

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
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useFactory: repositoryMockFactory
        },
      ],
    }).compile();


    service = module.get<AuthService>(AuthService);
    repositoryMock = module.get(getRepositoryToken(RefreshToken));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check if a refresh token is expired, revoked or null', async () => {

    const expiredToken = { id: 1, refreshToken: 'abcd', expires: new Date(Date.now() - 1000), revoked: null };
    const revokedToken = { id: 1, refreshToken: 'abcd', expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), revoked: true };
    const validToken = { id: 1, refreshToken: 'abcd', expires: new Date(Date.now() + 1000), revoked: null };

    let response: RefreshToken;

    repositoryMock.findOneBy.mockReturnValue(expiredToken);
    response = await service.isRefreshTokenValid('abcd');
    expect(response).toBeFalsy();

    repositoryMock.findOneBy.mockReturnValue(revokedToken);
    response = await service.isRefreshTokenValid('abcd');
    expect(response).toBeFalsy();

    repositoryMock.findOneBy.mockReturnValue(null);
    response = await service.isRefreshTokenValid('abcd');
    expect(response).toBeFalsy();

    repositoryMock.findOneBy.mockReturnValue(validToken);
    response = await service.isRefreshTokenValid('abcd');
    expect(response).toBeTruthy();

  });


});
