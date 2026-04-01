import { execSync } from 'child_process';

export default async function globalSetup() {
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres:docker@localhost:5432/prismaapi',
    },
    stdio: 'inherit',
  });
}
