#!/bin/bash

# Скрипт для проверки соединения с базой данных
echo "Проверяем подключение к базе данных..."

# Используем URL из переменной окружения или из аргумента
DB_URL=${1:-$DATABASE_URL}

if [ -z "$DB_URL" ]; then
  echo "Ошибка: DATABASE_URL не указан. Используйте переменную окружения DATABASE_URL или передайте URL как аргумент."
  exit 1
fi

echo "Используем URL: $DB_URL"

# Пробуем подключиться через prisma
npx prisma db execute --stdin <<EOF
SELECT 1;
EOF

if [ $? -eq 0 ]; then
  echo "Успешное подключение к базе данных!"
  exit 0
else
  echo "Ошибка подключения к базе данных."
  exit 1
fi
