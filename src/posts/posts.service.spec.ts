import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostsRepository } from './repositories/posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsService', () => {
  let service: PostsService;
  let repository: jest.Mocked<PostsRepository>;

  beforeEach(async () => {
    const repoMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostsRepository,
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get(PostsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repository.create on create', async () => {
    const dto: CreatePostDto = {
      title: 't',
      content: 'c',
      authorEmail: 'a@a.com',
    };
    const result = { id: 1 };
    repository.create.mockResolvedValue(result as any);
    await expect(service.create(dto)).resolves.toBe(result);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('should call repository.findAll on findAll', async () => {
    const result = [{ id: 1 }];
    repository.findAll.mockResolvedValue(result as any);
    await expect(service.findAll()).resolves.toBe(result);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should call repository.findOne on findOne', async () => {
    const result = { id: 1 };
    repository.findOne.mockResolvedValue(result as any);
    await expect(service.findOne(1)).resolves.toBe(result);
    expect(repository.findOne).toHaveBeenCalledWith(1);
  });

  it('should call repository.update on update', async () => {
    const dto: UpdatePostDto = { title: 't', authorEmail: 'a@a.com' };
    const result = { id: 1 };
    repository.update.mockResolvedValue(result as any);
    await expect(service.update(1, dto)).resolves.toBe(result);
    expect(repository.update).toHaveBeenCalledWith(1, dto);
  });

  it('should call repository.remove on remove', async () => {
    const result = { id: 1 };
    repository.remove.mockResolvedValue(result as any);
    await expect(service.remove(1)).resolves.toBe(result);
    expect(repository.remove).toHaveBeenCalledWith(1);
  });
});
