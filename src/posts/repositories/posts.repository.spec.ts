import { Test, TestingModule } from '@nestjs/testing';
import { PostsRepository } from './posts.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostEntity } from '../entities/post.entity';
import { NotFoundError } from 'src/common/errors/types/NotFoundError';

describe('PostsRepository', () => {
  let repository: PostsRepository;

  const mockPrisma = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<PostsRepository>(PostsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a post when author exists', async () => {
      const dto: CreatePostDto = {
        title: 'Post 1',
        content: 'Content',
        authorEmail: 'author@test.com',
      };
      const post: PostEntity = {
        id: 1,
        title: dto.title,
        content: dto.content,
        authorId: 1,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: dto.authorEmail,
      });
      mockPrisma.post.create.mockResolvedValue(post);

      const result = await repository.create(dto);
      expect(result).toEqual(post);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.authorEmail },
      });
      expect(mockPrisma.post.create).toHaveBeenCalled();
    });

    it('should throw NotFoundError if author does not exist', async () => {
      const dto: CreatePostDto = {
        title: 'Post 1',
        content: 'Content',
        authorEmail: 'notfound@test.com',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(repository.create(dto)).rejects.toThrow(NotFoundError);
      expect(mockPrisma.post.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts: PostEntity[] = [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content',
          authorId: 1,
          published: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.post.findMany.mockResolvedValue(posts);

      const result = await repository.findAll();
      expect(result).toEqual(posts);
      expect(mockPrisma.post.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const post: PostEntity = {
        id: 1,
        title: 'Post 1',
        content: 'Content',
        authorId: 1,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.post.findUnique.mockResolvedValue(post);

      const result = await repository.findOne(1);
      expect(result).toEqual(post);
      expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { author: { select: { name: true, email: true } } },
      });
    });
  });

  describe('update', () => {
    it('should update post without changing author', async () => {
      const dto: UpdatePostDto = { title: 'Updated Title', authorEmail: 'author@test.com' };
      const post: PostEntity = {
        id: 1,
        title: dto.title,
        content: 'Content',
        authorId: 1,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: dto.authorEmail,
      });
      mockPrisma.post.update.mockResolvedValue(post);

      const result = await repository.update(1, dto);
      expect(result).toEqual(post);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.authorEmail },
      });
      expect(mockPrisma.post.update).toHaveBeenCalled();
    });

    it('should update post with authorEmail when author exists', async () => {
      const dto: UpdatePostDto = {
        title: 'Updated Title',
        authorEmail: 'author@test.com',
      };
      const post: PostEntity = {
        id: 1,
        title: dto.title,
        content: 'Content',
        authorId: 1,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: dto.authorEmail,
      });
      mockPrisma.post.update.mockResolvedValue(post);

      const result = await repository.update(1, dto);
      expect(result).toEqual(post);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.authorEmail },
      });
      expect(mockPrisma.post.update).toHaveBeenCalled();
    });

    it('should throw NotFoundError if authorEmail does not exist', async () => {
      const dto: UpdatePostDto = {
        title: 'Updated Title',
        authorEmail: 'notfound@test.com',
      };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(repository.update(1, dto)).rejects.toThrow(NotFoundError);
      expect(mockPrisma.post.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete post', async () => {
      const post: PostEntity = {
        id: 1,
        title: 'Post 1',
        content: 'Content',
        authorId: 1,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.post.delete.mockResolvedValue(post);

      const result = await repository.remove(1);
      expect(result).toEqual(post);
      expect(mockPrisma.post.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
