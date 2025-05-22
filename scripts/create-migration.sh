#!/bin/sh

# Создаем первую миграцию Prisma

echo "Создание первой миграции Prisma..."
npx prisma migrate dev --name init
