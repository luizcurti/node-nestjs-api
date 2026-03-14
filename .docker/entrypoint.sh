#!/bin/bash
set -e

echo "Waiting for database to be ready..."
until pg_isready -h db -p 5432 -U postgres 2>/dev/null; do
  echo "Database not ready yet. Retrying..."
  sleep 2
done
echo "Database is ready!"

echo "Generating Prisma Client for Linux..."
npx prisma generate

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm run start:dev
