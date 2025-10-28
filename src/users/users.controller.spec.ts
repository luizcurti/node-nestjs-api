import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { NotFoundError } from 'src/common/errors/types/NotFoundError';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
    mockUsersService.create.mockResolvedValue(user);

    const result = await controller.create(dto);
    expect(result).toEqual(user);
    expect(service.create).toHaveBeenCalledWith(dto);
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
    mockUsersService.findAll.mockResolvedValue(users);

    const result = await controller.findAll();
    expect(result).toEqual(users);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a user by id', async () => {
    const user: UserEntity = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    mockUsersService.findOne.mockResolvedValue(user);

    const result = await controller.findOne('1');
    expect(result).toEqual(user);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a user', async () => {
    const dto: UpdateUserDto = { name: 'Jane' };
    const updatedUser: UserEntity = {
      id: 1,
      name: 'Jane',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    mockUsersService.update.mockResolvedValue(updatedUser);

    const result = await controller.update('1', dto);
    expect(result).toEqual(updatedUser);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a user', async () => {
    const deletedUser: UserEntity = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    mockUsersService.remove.mockResolvedValue(deletedUser);

    const result = await controller.remove('1');
    expect(result).toEqual(deletedUser);
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should handle NotFoundError from service', async () => {
    mockUsersService.findOne.mockRejectedValue(
      new NotFoundError('User not found.'),
    );

    await expect(controller.findOne('999')).rejects.toThrow(NotFoundError);
    expect(service.findOne).toHaveBeenCalledWith(999);
  });
});
