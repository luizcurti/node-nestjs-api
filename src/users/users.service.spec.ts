import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { NotFoundError } from 'src/common/errors/types/NotFoundError';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      name: 'John',
      email: 'john@example.com',
      admin: false,
    };
    const user: UserEntity = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    mockRepository.create.mockResolvedValue(user);

    const result = await service.create(dto);
    expect(result).toEqual(user);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('should return all users', async () => {
    const users: UserEntity[] = [
      {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        admin: false,
        createdAt: new Date(),
      },
    ];
    mockRepository.findAll.mockResolvedValue(users);

    const result = await service.findAll();
    expect(result).toEqual(users);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should return a user by id', async () => {
    const user: UserEntity = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    mockRepository.findOne.mockResolvedValue(user);

    const result = await service.findOne(1);
    expect(result).toEqual(user);
    expect(repository.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundError if user does not exist', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundError);
    expect(repository.findOne).toHaveBeenCalledWith(999);
  });

  it('should update a user', async () => {
    const dto: UpdateUserDto = { name: 'Jane' };
    const existingUser: UserEntity = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    const updatedUser: UserEntity = {
      id: 1,
      name: 'Jane',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    mockRepository.findOne.mockResolvedValue(existingUser);
    mockRepository.update.mockResolvedValue(updatedUser);

    const result = await service.update(1, dto);
    expect(result).toEqual(updatedUser);
    expect(repository.findOne).toHaveBeenCalledWith(1);
    expect(repository.update).toHaveBeenCalledWith(1, dto);
  });

  it('should throw NotFoundError when updating non-existent user', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    await expect(service.update(999, { name: 'X' })).rejects.toThrow(
      NotFoundError,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should remove a user', async () => {
    const deletedUser: UserEntity = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    mockRepository.findOne.mockResolvedValue(deletedUser);
    mockRepository.remove.mockResolvedValue(deletedUser);

    const result = await service.remove(1);
    expect(result).toEqual(deletedUser);
    expect(repository.findOne).toHaveBeenCalledWith(1);
    expect(repository.remove).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundError when removing non-existent user', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    await expect(service.remove(999)).rejects.toThrow(NotFoundError);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
