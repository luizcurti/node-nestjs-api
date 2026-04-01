import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConflictInterceptor } from '../src/common/errors/interceptors/conflict.interceptor';
import { DatabaseInterceptor } from '../src/common/errors/interceptors/database.interceptor';
import { NotFoundInterceptor } from '../src/common/errors/interceptors/notfound.interceptor';
import { UnauthorizedInterceptor } from '../src/common/errors/interceptors/unauthorized.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(
      new NotFoundInterceptor(),
      new UnauthorizedInterceptor(),
      new ConflictInterceptor(),
      new DatabaseInterceptor(),
    );

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  // ─── CREATE ───────────────────────────────────────────────────────────────

  it('POST /users → 201 ao criar usuário válido', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Test User', email: 'user@test.com', admin: false })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      name: 'Test User',
      email: 'user@test.com',
      admin: false,
    });
    expect(res.body.posts).toEqual([]);
    createdUserId = res.body.id;
  });

  it('POST /users → 201 sem campo admin (deve usar default false)', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'No Admin Field', email: 'noadmin@test.com' })
      .expect(201);

    expect(res.body.admin).toBe(false);

    await prisma.user.delete({ where: { id: res.body.id } });
  });

  it('POST /users → 409 ao criar usuário com email duplicado', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Duplicate', email: 'user@test.com', admin: false })
      .expect(409);

    expect(res.body.message).toBeDefined();
  });

  it('POST /users → 400 ao criar usuário sem email', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'No Email', admin: false })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /users → 400 ao criar usuário com email inválido', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Bad Email', email: 'not-an-email', admin: false })
      .expect(400);
  });

  it('POST /users → 400 ao criar usuário sem nome', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'noname@test.com', admin: false })
      .expect(400);
  });

  it('POST /users → 400 com campo extra (forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Extra',
        email: 'extra@test.com',
        admin: false,
        hacker: true,
      })
      .expect(400);
  });

  // ─── LIST ─────────────────────────────────────────────────────────────────

  it('GET /users → 200 retorna lista de usuários', async () => {
    const res = await request(app.getHttpServer()).get('/users').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toMatchObject({ id: expect.any(Number) });
  });

  // ─── FIND ONE ─────────────────────────────────────────────────────────────

  it('GET /users/:id → 200 retorna usuário por id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .expect(200);

    expect(res.body).toMatchObject({
      id: createdUserId,
      email: 'user@test.com',
    });
  });

  it('GET /users/:id → 404 para id inexistente', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/999999')
      .expect(404);

    expect(res.body.message).toBeDefined();
  });

  it('GET /users/:id → 400 para id não-numérico', async () => {
    await request(app.getHttpServer()).get('/users/abc').expect(400);
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  it('PATCH /users/:id → 200 atualiza nome do usuário', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${createdUserId}`)
      .send({ name: 'Updated Name' })
      .expect(200);

    expect(res.body.name).toBe('Updated Name');
    expect(res.body.email).toBe('user@test.com');
  });

  it('PATCH /users/:id → 404 para id inexistente', async () => {
    await request(app.getHttpServer())
      .patch('/users/999999')
      .send({ name: 'Ghost' })
      .expect(404);
  });

  it('PATCH /users/:id → 400 para id não-numérico', async () => {
    await request(app.getHttpServer())
      .patch('/users/abc')
      .send({ name: 'X' })
      .expect(400);
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────

  it('DELETE /users/:id → 200 remove o usuário', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .expect(200);

    expect(res.body.id).toBe(createdUserId);
  });

  it('DELETE /users/:id → 404 para id inexistente', async () => {
    await request(app.getHttpServer())
      .delete('/users/999999')
      .expect(404);
  });

  it('DELETE /users/:id → 400 para id não-numérico', async () => {
    await request(app.getHttpServer()).delete('/users/abc').expect(400);
  });
});

describe('Posts CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authorId: number;
  let createdPostId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(
      new NotFoundInterceptor(),
      new UnauthorizedInterceptor(),
      new ConflictInterceptor(),
      new DatabaseInterceptor(),
    );

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const author = await prisma.user.create({
      data: { name: 'Author', email: 'author@posts.com', admin: false },
    });
    authorId = author.id;
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  // ─── CREATE ───────────────────────────────────────────────────────────────

  it('POST /posts → 201 ao criar post válido', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: 'Post title',
        content: 'Post content',
        authorEmail: 'author@posts.com',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      title: 'Post title',
      content: 'Post content',
      authorId,
      published: false,
    });
    createdPostId = res.body.id;
  });

  it('POST /posts → 201 ao criar post sem content (opcional)', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'No Content', authorEmail: 'author@posts.com' })
      .expect(201);

    expect(res.body.content).toBeNull();
    await prisma.post.delete({ where: { id: res.body.id } });
  });

  it('POST /posts → 404 ao criar post com autor inexistente', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: 'Ghost Post',
        authorEmail: 'ghost@nothere.com',
      })
      .expect(404);

    expect(res.body.message).toBeDefined();
  });

  it('POST /posts → 400 ao criar post sem título', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({ content: 'No title', authorEmail: 'author@posts.com' })
      .expect(400);
  });

  it('POST /posts → 400 ao criar post sem authorEmail', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'No author' })
      .expect(400);
  });

  it('POST /posts → 400 com campo extra (forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: 'Extra',
        authorEmail: 'author@posts.com',
        hacker: true,
      })
      .expect(400);
  });

  // ─── LIST ─────────────────────────────────────────────────────────────────

  it('GET /posts → 200 retorna lista de posts', async () => {
    const res = await request(app.getHttpServer()).get('/posts').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toMatchObject({
      id: expect.any(Number),
      author: { name: expect.any(String) },
    });
  });

  // ─── FIND ONE ─────────────────────────────────────────────────────────────

  it('GET /posts/:id → 200 retorna post por id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/posts/${createdPostId}`)
      .expect(200);

    expect(res.body).toMatchObject({
      id: createdPostId,
      title: 'Post title',
      author: { name: 'Author', email: 'author@posts.com' },
    });
  });

  it('GET /posts/:id → 404 para id inexistente', async () => {
    await request(app.getHttpServer()).get('/posts/999999').expect(404);
  });

  it('GET /posts/:id → 400 para id não-numérico', async () => {
    await request(app.getHttpServer()).get('/posts/abc').expect(400);
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  it('PATCH /posts/:id → 200 atualiza título do post', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/posts/${createdPostId}`)
      .send({ title: 'Updated title' })
      .expect(200);

    expect(res.body.title).toBe('Updated title');
  });

  it('PATCH /posts/:id → 200 atualiza autor do post via email', async () => {
    const newAuthor = await prisma.user.create({
      data: { name: 'New Author', email: 'newauthor@posts.com', admin: false },
    });

    const res = await request(app.getHttpServer())
      .patch(`/posts/${createdPostId}`)
      .send({ authorEmail: 'newauthor@posts.com' })
      .expect(200);

    expect(res.body.authorId).toBe(newAuthor.id);

    await request(app.getHttpServer())
      .patch(`/posts/${createdPostId}`)
      .send({ authorEmail: 'author@posts.com' });
    await prisma.user.delete({ where: { id: newAuthor.id } });
  });

  it('PATCH /posts/:id → 404 para id inexistente', async () => {
    await request(app.getHttpServer())
      .patch('/posts/999999')
      .send({ title: 'Ghost' })
      .expect(404);
  });

  it('PATCH /posts/:id → 404 ao atualizar autor para email inexistente', async () => {
    await request(app.getHttpServer())
      .patch(`/posts/${createdPostId}`)
      .send({ authorEmail: 'nobody@nowhere.com' })
      .expect(404);
  });

  it('PATCH /posts/:id → 400 para id não-numérico', async () => {
    await request(app.getHttpServer())
      .patch('/posts/abc')
      .send({ title: 'X' })
      .expect(400);
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────

  it('DELETE /posts/:id → 200 remove o post', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/posts/${createdPostId}`)
      .expect(200);

    expect(res.body.id).toBe(createdPostId);
  });

  it('DELETE /posts/:id → 404 para id inexistente', async () => {
    await request(app.getHttpServer()).delete('/posts/999999').expect(404);
  });

  it('DELETE /posts/:id → 400 para id não-numérico', async () => {
    await request(app.getHttpServer()).delete('/posts/abc').expect(400);
  });

  // ─── CASCADE DELETE ───────────────────────────────────────────────────────

  it('DELETE /users/:id → 200 remove usuário e seus posts em cascata', async () => {
    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Cascade User', email: 'cascade@test.com', admin: false })
      .expect(201);

    const cascadeUserId = userRes.body.id;

    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'Cascade Post', authorEmail: 'cascade@test.com' })
      .expect(201);

    const cascadePostId = postRes.body.id;

    await request(app.getHttpServer())
      .delete(`/users/${cascadeUserId}`)
      .expect(200);

    const postInDb = await prisma.post.findUnique({
      where: { id: cascadePostId },
    });
    expect(postInDb).toBeNull();
  });
});
