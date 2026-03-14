# NestJS Blog API

A RESTful API built with [NestJS](https://nestjs.com/) v11, [Prisma ORM](https://www.prisma.io/) v6, and PostgreSQL. Covers full CRUD for users and posts, request validation, structured error handling, Swagger docs, Docker support, and unit test coverage.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript 5 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Validation | class-validator + class-transformer |
| Documentation | Swagger (OpenAPI) |
| Testing | Jest 30 |
| Linting | ESLint 9 + Prettier |
| Containerization | Docker + Docker Compose |

## Features

- **Users:** create, list, get by id, update, delete
- **Posts:** create, list, get by id, update, delete
- Posts always require an existing author (enforced at DB level with `NOT NULL` + cascade delete)
- `updatedAt` auto-updated by Prisma on every post edit
- Input validation with `whitelist` and `forbidNonWhitelisted`
- Structured HTTP error responses (409 Conflict, 404 Not Found, 400 Bad Request)
- Prisma error codes mapped to domain errors (`P2002` → 409, `P2025` → 404)
- Swagger UI at `/api`
- Ready-to-import Postman collection with all endpoints

## Data Model

```
User
  id        Int       (PK, autoincrement)
  email     String    (unique)
  name      String
  admin     Boolean   (default: false)
  createdAt DateTime

Post
  id        Int       (PK, autoincrement)
  title     String    (max 255 chars)
  content   String?
  published Boolean   (default: false)
  createdAt DateTime
  updatedAt DateTime  (auto-updated)
  authorId  Int       (FK → User, cascade delete)
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose

### Running with Docker (recommended)

```bash
docker compose up --build
```

This builds the app image, starts PostgreSQL, runs Prisma migrations automatically, and starts the API in watch mode. The API will be available at `http://localhost:3000`.

### Running locally

**1. Install dependencies**
```bash
npm install
```

**2. Set up environment variables**

Create a `.env` file in the project root:
```
DATABASE_URL="postgresql://postgres:docker@localhost:5432/prismaapi"
```

**3. Start a PostgreSQL instance** (or use Docker just for the DB)
```bash
docker compose up db -d
```

**4. Run migrations**
```bash
npx prisma migrate deploy
```

**5. Start the API**
```bash
npm run start:dev
```

## API Reference

### Users

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users` | Create a user |
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get a user by ID |
| `PATCH` | `/users/:id` | Update a user |
| `DELETE` | `/users/:id` | Delete a user (also deletes their posts) |

**Create / Update user body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "admin": false
}
```

### Posts

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/posts` | Create a post |
| `GET` | `/posts` | List all posts |
| `GET` | `/posts/:id` | Get a post by ID |
| `PATCH` | `/posts/:id` | Update a post |
| `DELETE` | `/posts/:id` | Delete a post |

**Create post body:**
```json
{
  "title": "My Post",
  "content": "Post content here",
  "authorEmail": "john@example.com"
}
```

**Update post body** (all fields optional):
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "authorEmail": "other@example.com"
}
```

### Error Responses

| Status | Cause |
|--------|-------|
| `400 Bad Request` | Invalid input or database error |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Unique constraint violation (e.g. duplicate email) |

## Swagger

Interactive API documentation is available at:
```
http://localhost:3000/api
```

## Postman Collection

Import `postman_collection.json` into Postman. The collection is organized into two folders — **Users** and **Posts** — covering all 10 endpoints.

## Testing

```bash
# Run all unit tests
npm run test

# Run tests with coverage report
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

**47 tests** across 8 test suites covering controllers, services, and repositories.

## Linting & Formatting

```bash
# Check for lint errors
npm run lint:check

# Fix lint errors automatically
npm run lint

# Format code with Prettier
npm run format
```

## Project Structure

```
├── src/
│   ├── main.ts                        # App bootstrap, global pipes & interceptors
│   ├── app.module.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── repositories/
│   ├── posts/
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   ├── posts.module.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── repositories/
│   ├── prisma/
│   │   └── prisma.service.ts
│   └── common/
│       ├── errors/
│       │   ├── interceptors/          # ConflictInterceptor, NotFoundInterceptor, etc.
│       │   ├── types/                 # ConflictError, NotFoundError, DatabaseError, etc.
│       │   └── utils/                 # handleDatabaseErrors, isPrismaError
│       └── filters/
│           └── http-exception.filter.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .docker/
│   └── entrypoint.sh                  # Waits for DB, runs migrations, starts app
├── docker-compose.yml
├── Dockerfile
├── postman_collection.json
└── package.json
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start API in watch mode |
| `npm run start:prod` | Start compiled production build |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run format` | Format all source files with Prettier |
| `npm run lint` | Run ESLint and auto-fix |
| `npm run lint:check` | Run ESLint without fixing |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
