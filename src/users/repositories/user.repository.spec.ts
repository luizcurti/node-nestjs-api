import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
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
    mockPrisma.user.create.mockResolvedValue(user);

    const result = await repository.create(dto);
    expect(result).toEqual(user);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: dto,
      include: { posts: { select: { title: true, createdAt: true } } },
    });
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
    mockPrisma.user.findMany.mockResolvedValue(users);

    const result = await repository.findAll();
    expect(result).toEqual(users);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      include: { posts: { select: { title: true, createdAt: true } } },
    });
  });

  it('should return a user by id', async () => {
    const user: UserEntity = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await repository.findOne(1);
    expect(result).toEqual(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { posts: { select: { title: true, createdAt: true } } },
    });
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
    mockPrisma.user.update.mockResolvedValue(updatedUser);

    const result = await repository.update(1, dto);
    expect(result).toEqual(updatedUser);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
      include: { posts: { select: { title: true, createdAt: true } } },
    });
  });

  it('should remove a user', async () => {
    const deletedUser: UserEntity = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      admin: false,
      createdAt: new Date(),
    };
    mockPrisma.user.delete.mockResolvedValue(deletedUser);

    const result = await repository.remove(1);
    expect(result).toEqual(deletedUser);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { posts: { select: { title: true, createdAt: true } } },
    });
  });
});
