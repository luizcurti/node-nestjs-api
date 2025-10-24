import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPostsService = {
    create: jest.fn(dto => ({ id: 1, ...dto })),
    findAll: jest.fn(() => [{ id: 1, title: 'Post 1' }]),
    findOne: jest.fn(() => ({ id: 1, title: 'Post 1' })),
    update: jest.fn((id, dto) => ({ id, ...dto })),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    remove: jest.fn((_id: any) => ({ deleted: true })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a post', () => {
    const dto: CreatePostDto = {
      title: 'New Post',
      content: 'Content',
      authorEmail: 'email@teste.com',
    };
    expect(controller.create(dto)).toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all posts', () => {
    expect(controller.findAll()).toEqual([{ id: 1, title: 'Post 1' }]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a post by id', () => {
    expect(controller.findOne('1')).toEqual({ id: 1, title: 'Post 1' });
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a post', () => {
    const dto: UpdatePostDto = { title: 'Updated Post' };
    expect(controller.update('1', dto)).toEqual({ id: 1, ...dto });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a post', () => {
    expect(controller.remove('1')).toEqual({ deleted: true });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
