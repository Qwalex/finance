#!/bin/sh

# Ожидаем, пока база данных будет доступна
echo "Ожидаем, пока база данных будет доступна..."
until npx prisma db push --skip-generate; do
  echo "База данных недоступна, ожидаем..."
  sleep 2
done

echo "База данных доступна!"

# Применяем миграции
echo "Применяем миграции..."
npx prisma migrate deploy

# Проверяем, нужно ли инициализировать демо-данные
echo "Проверяем наличие данных в базе..."
TRANSACTION_COUNT=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) FROM "Transaction";
EOF
)

if echo "$TRANSACTION_COUNT" | grep -q "0"; then
  echo "База данных пуста, инициализируем демо-данные..."
  # Запускаем приложение в фоне
  npm run start &
  
  # Даем приложению немного времени для запуска
  sleep 5
  
  # Вызываем эндпоинт для загрузки демо-данных
  curl -X POST http://localhost:3000/api/demo/init
  
  # Убиваем фоновый процесс
  kill %1
fi

# Запускаем приложение
echo "Запускаем приложение..."
npm run start
