#!/bin/sh

# Выводим информацию о подключении к БД (без пароля)
DB_URL_SAFE=$(echo "$DATABASE_URL" | sed 's/:[^:]*@/:*****@/')
echo "Будет использовано подключение к БД: $DB_URL_SAFE"

# Ожидаем, пока база данных будет доступна
echo "Ожидаем, пока база данных будет доступна..."

# Получаем максимальное количество повторных попыток из переменной окружения или используем значение по умолчанию
MAX_RETRIES=${MAX_DB_CONNECTION_RETRIES:-15}
RETRY_INTERVAL=${DB_CONNECTION_RETRY_INTERVAL:-2}

echo "Максимальное количество попыток: $MAX_RETRIES, интервал: $RETRY_INTERVAL секунд"

RETRIES=0
# Проверка соединения с базой данных
until npx prisma db push --skip-generate; do
  RETRIES=$((RETRIES+1))
  
  if [ $RETRIES -ge $MAX_RETRIES ]; then
    echo "Ошибка: превышено максимальное количество попыток подключения к базе данных ($MAX_RETRIES)"
    echo "Проверьте URL подключения и доступность сервера базы данных"
    echo "URL: $DB_URL_SAFE"
    
    # Расширенная диагностика
    echo "Проверка сетевого соединения..."
    HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
    PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    if [ -n "$HOST" ] && [ -n "$PORT" ]; then
      echo "Проверка подключения к $HOST:$PORT..."
      nc -z -v -w5 "$HOST" "$PORT"
    else
      echo "Не удалось извлечь хост и порт из строки подключения"
    fi
    
    exit 1
  fi
  
  echo "База данных недоступна, ожидаем... Попытка $RETRIES из $MAX_RETRIES"
  sleep $RETRY_INTERVAL
done

echo "База данных доступна!"

# Иногда может потребоваться обновление схемы без миграции
echo "Синхронизируем схему базы данных..."
npx prisma db push --skip-generate

# Применяем миграции
echo "Применяем миграции..."
npx prisma migrate deploy

# Проверяем, нужно ли инициализировать демо-данные
echo "Проверяем наличие данных в базе..."
set +e  # Не прерывать выполнение при ошибке
TRANSACTION_COUNT=$(npx prisma db execute --url="$DATABASE_URL" --stdin <<EOF
SELECT COUNT(*) FROM "Transaction";
EOF
)
EXIT_CODE=$?
set -e  # Вернуть прерывание при ошибке

# Если команда завершилась с ошибкой, могла быть проблема с таблицей
if [ $EXIT_CODE -ne 0 ]; then
  echo "Возникла проблема при проверке таблицы Transaction. Возможно, таблица не существует."
  echo "Попробуем применить миграции еще раз..."
  npx prisma migrate deploy
  # Повторяем проверку
  TRANSACTION_COUNT=$(npx prisma db execute --url="$DATABASE_URL" --stdin <<EOF
SELECT COUNT(*) FROM "Transaction";
EOF
)
fi

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
