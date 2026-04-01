import { Injectable } from '@nestjs/common';
import { NotFoundError } from 'src/common/errors/types/NotFoundError';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';
import { PostsRepository } from './repositories/posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly repository: PostsRepository) {}

  create(createPostDto: CreatePostDto) {
    return this.repository.create(createPostDto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<PostEntity> {
    const post = await this.repository.findOne(id);

    if (!post) {
      throw new NotFoundError('Post not found.');
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    await this.findOne(id);
    return this.repository.update(id, updatePostDto);
  }

  async remove(id: number): Promise<PostEntity> {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
