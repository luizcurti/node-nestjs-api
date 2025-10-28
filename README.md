# Node NestJS API Example

A robust RESTful API built with [NestJS](https://nestjs.com/) and [Prisma ORM](https://www.prisma.io/) using PostgreSQL. This project includes user and post management, full test coverage, Docker support, and a ready-to-import Postman collection.

## Features
- User CRUD (Create, Read, Update, Delete)
- Post CRUD with author relation
- PostgreSQL database (local or Docker)
- Prisma ORM for type-safe database access
- Full unit test coverage (Jest)
- Linting and formatting (ESLint, Prettier)
- Docker and Docker Compose support
- Example Postman collection
- GitHub Actions CI workflow

## Getting Started

### Prerequisites
- Node.js 20+
- npm 9+
- Docker (optional, for containerized DB)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in the project root:
```
DATABASE_URL="postgresql://postgres:docker@localhost:5432/prismaapi"
```

### Database Setup
#### Using Docker Compose (recommended)
```bash
docker-compose up -d
```
This will start a PostgreSQL database on port 5432.

#### Prisma Migrate
```bash
npx prisma migrate deploy
# or for development
npx prisma migrate dev
```

### Running the Application
```bash
npm run start:dev
```
The API will be available at `http://localhost:3000`.

### API Documentation
If Swagger is enabled, access docs at:
```
http://localhost:3000/api
```

### Running Tests
- **Unit tests:**
  ```bash
  npm run test
  ```
- **Test coverage:**
  ```bash
  npm run test:cov
  ```
- **Lint:**
  ```bash
  npm run lint
  ```

### Postman Collection
Import the file `postman_collection.json` into Postman to test all main endpoints.

## Project Structure
```
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── users/
│   ├── posts/
│   ├── prisma/
│   └── common/
├── prisma/
│   └── schema.prisma
├── test/
├── .env
├── docker-compose.yml
├── Dockerfile
├── package.json
├── README.md
└── postman_collection.json
```

## CI/CD
A GitHub Actions workflow is provided in `.github/workflows/ci.yml` to run lint, tests, and upload coverage on every push or PR to `main`.

## Useful Commands
- `npm run start:dev` — Start API in watch mode
- `npm run build` — Compile TypeScript
- `npm run format` — Format code with Prettier
- `npm run lint` — Run ESLint
- `npm run test` — Run unit tests
- `npm run test:cov` — Run tests with coverage