#!/bin/bash

# Запускаем PostgreSQL в Docker для разработки
echo "Запускаем PostgreSQL в Docker для разработки..."
docker-compose -f docker-compose.dev.yml up -d

# Ждем, пока PostgreSQL запустится
echo "Ждем, пока PostgreSQL запустится..."
sleep 10

# Обновляем .env файл для локальной разработки
echo "Обновляем .env файл для локальной разработки..."
sed -i 's/^DATABASE_URL=.*/DATABASE_URL="postgresql:\/\/postgres:postgres@localhost:5433\/finance_db?schema=public"/' .env

# Создаем миграции Prisma
echo "Создаем миграции Prisma..."
npx prisma migrate dev --name init

# Генерируем Prisma клиент
echo "Генерируем Prisma клиент..."
npx prisma generate

# Запускаем приложение в режиме разработки
echo "Запускаем приложение в режиме разработки..."
npm run dev
