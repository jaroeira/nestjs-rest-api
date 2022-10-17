import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(entity => entity),
  findOneBy: jest.fn(entity => entity),
  save: jest.fn(entity => entity),
  remove: jest.fn(entity => entity)
}));



describe('UsersService', () => {
  let service: UsersService;
  let repositoryMock: MockType<Repository<User>>;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repositoryMock = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user', async () => {
    const user: User = { id: 1, email: 'test@test.com', passwordHash: 'sdfsfsdfsdf' };
    repositoryMock.findOneBy.mockReturnValue(Promise.resolve(user));

    const result = await service.findOne(user.id);

    expect(JSON.stringify(result)).toEqual(JSON.stringify(user));

  });

  it('should throw user not found on findOne', async () => {
    repositoryMock.findOneBy.mockReturnValue(Promise.resolve(undefined));

    try {
      await service.findOne(1);
    } catch (e: any) {
      expect(e.message).toBe('No user found with id 1');
    }

  });

  it('should throw - Email in use', async () => {
    const user: User = { id: 1, email: 'test@test.com', passwordHash: 'sdfsfsdfsdf' };
    repositoryMock.findOneBy.mockReturnValue(Promise.resolve(user));

    const createUserDto: CreateUserDto = { email: 'test@test.com', password: '12345678' };

    try {
      await service.create(createUserDto);
    } catch (e: any) {
      expect(e.message).toBe('Email in use');
    }

  });

  it('should encrypt password', async () => {
    repositoryMock.findOneBy.mockReturnValue(Promise.resolve(undefined));
    repositoryMock.save.mockImplementation((x) => (x));
    const createUserDto: CreateUserDto = { email: 'test@test.com', password: '12345678' };
    const result = await service.create(createUserDto);

    expect(result.passwordHash).not.toBe(createUserDto.password);

  });

  it('should throw user not found on update', async () => {
    repositoryMock.findOneBy.mockReturnValue(Promise.resolve(undefined));
    repositoryMock.save.mockImplementation((x) => (x));

    const updateUsetDto: UpdateUserDto = { email: 'test@test.com' };

    try {
      await service.update(1, updateUsetDto);
    } catch (e: any) {
      expect(e.message).toBe('No user found with id 1');
    }
  });

  it('should throw email in use on update', async () => {
    const user: User = { id: 2, email: 'test@test.com', passwordHash: 'sdfsfsdfsdf' };
    repositoryMock.findOneBy.mockReturnValue(Promise.resolve(user));
    repositoryMock.save.mockImplementation((x) => (x));

    const updateUsetDto: UpdateUserDto = { email: 'test@test.com' };

    try {
      await service.update(1, updateUsetDto);
    } catch (e: any) {
      expect(e.message).toBe('Email in use');
    }

  });

  it('should throw user not found on remove', async () => {
    repositoryMock.findOneBy.mockReturnValue(Promise.resolve(undefined));

    try {
      await service.remove(1);
    } catch (e: any) {
      expect(e.message).toBe('No user found with id 1');
    }
  });

  it('should return removed user', async () => {
    const user: User = { id: 1, email: 'test@test.com', passwordHash: 'sdfsfsdfsdf' };
    repositoryMock.findOneBy.mockReturnValue(Promise.resolve(user));
    repositoryMock.remove.mockImplementation((x) => (x));
    const result = await service.remove(1);

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
  });

  it('should return updated user', async () => {
    const user: User = { id: 1, email: 'test@test.com', passwordHash: 'sdfsfsdfsdf' };
    repositoryMock.save.mockImplementation((x) => (x));
    repositoryMock.findOneBy.mockReturnValueOnce(Promise.resolve(user)).mockReturnValue(Promise.resolve(undefined));

    const updateUsetDto: UpdateUserDto = { email: 'updated@test.com' };
    const result = await service.update(1, updateUsetDto);

    expect(result).toBeDefined();
    expect(result.email).toBe('updated@test.com');

    // if email exists but the id is the same it should not throw error
    const updateUsetDto2: UpdateUserDto = { email: 'test@test.com' };
    repositoryMock.findOneBy.mockReturnValue(Promise.resolve(user));
    const result2 = await service.update(1, updateUsetDto2);

    expect(result).toBeDefined();
    expect(result.email).toBe('test@test.com');

  });


});
