#!/bin/bash

# Загружаем переменные окружения из файла .env, если он существует
if [ -f ".env" ]; then
  echo "Загружаем переменные окружения из файла .env..."
  export $(grep -v '^#' .env | xargs)
fi

# Проверка использования внешней или локальной БД
if [ "$1" == "--external-db" ] || [ "$EXTERNAL_DB" == "true" ]; then
  USE_EXTERNAL_DB=true
  echo "Режим внешней БД активирован. Будет использоваться база данных по адресу: $POSTGRESQL_HOST"
else
  USE_EXTERNAL_DB=false
  echo "Режим локальной БД активирован. Будет запущен локальный контейнер PostgreSQL."
  
  # Проверяем наличие директории для данных PostgreSQL
  if [ ! -d "./postgres-data" ]; then
    echo "Создаем директорию для данных PostgreSQL..."
    mkdir -p ./postgres-data
    # Устанавливаем корректные права доступа для PostgreSQL
    chmod 777 ./postgres-data
  fi
  
  # При использовании локальной БД убедимся, что переменные окружения настроены правильно
  export POSTGRESQL_HOST=postgres
  export POSTGRESQL_PORT=5432
fi

# Остановка и удаление текущих контейнеров (если существуют)
echo "Останавливаем существующие контейнеры..."
docker compose down

# Проверяем, загрузились ли переменные окружения, или используем значения по умолчанию
if [ -z "$POSTGRESQL_USER" ]; then
  export POSTGRESQL_USER=finance_user
  echo "POSTGRESQL_USER не задан, используем значение по умолчанию: finance_user"
else
  echo "Используем POSTGRESQL_USER из .env: $POSTGRESQL_USER"
fi

if [ -z "$POSTGRESQL_PASSWORD" ]; then
  export POSTGRESQL_PASSWORD=finance_password
  echo "POSTGRESQL_PASSWORD не задан, используем значение по умолчанию: finance_password"
else
  echo "Используем POSTGRESQL_PASSWORD из .env: [скрыто]"
fi

if [ -z "$POSTGRESQL_DBNAME" ]; then
  export POSTGRESQL_DBNAME=finance_db
  echo "POSTGRESQL_DBNAME не задан, используем значение по умолчанию: finance_db"
else
  echo "Используем POSTGRESQL_DBNAME из .env: $POSTGRESQL_DBNAME"
fi

# Если используется внешняя БД, проверим доступность
if [ "$USE_EXTERNAL_DB" == "true" ]; then
  echo "Проверяем доступность внешней базы данных..."
  
  # Проверяем наличие утилиты nc (netcat)
  if command -v nc >/dev/null 2>&1; then
    # Используем netcat для проверки соединения
    if nc -z -w 5 "$POSTGRESQL_HOST" "$POSTGRESQL_PORT"; then
      echo "База данных доступна по адресу $POSTGRESQL_HOST:$POSTGRESQL_PORT"
    else
      echo "ВНИМАНИЕ: База данных недоступна по адресу $POSTGRESQL_HOST:$POSTGRESQL_PORT"
      echo "Убедитесь, что внешняя база данных запущена и доступна из вашей сети."
      read -p "Продолжить, несмотря на ошибку? (y/n) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Операция прервана пользователем."
        exit 1
      fi
    fi
  else
    # Если netcat недоступен, пробуем тайм-аут с помощью timeout и telnet
    echo "Утилита netcat не найдена, используем альтернативный метод проверки..."
    if command -v timeout >/dev/null 2>&1 && command -v telnet >/dev/null 2>&1; then
      if timeout 5 telnet "$POSTGRESQL_HOST" "$POSTGRESQL_PORT" >/dev/null 2>&1; then
        echo "База данных доступна по адресу $POSTGRESQL_HOST:$POSTGRESQL_PORT"
      else
        echo "ВНИМАНИЕ: База данных недоступна по адресу $POSTGRESQL_HOST:$POSTGRESQL_PORT"
        echo "Убедитесь, что внешняя база данных запущена и доступна из вашей сети."
        read -p "Продолжить, несмотря на ошибку? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
          echo "Операция прервана пользователем."
          exit 1
        fi
      fi
    else
      echo "ВНИМАНИЕ: Не могу проверить доступность базы данных. Утилиты netcat и telnet отсутствуют."
      echo "Продолжаем, предполагая, что база данных доступна."
    fi
  fi
  
  # Выводим информацию о подключении к базе данных
  echo "Будет использовано подключение к базе данных:"
  echo "  Хост: $POSTGRESQL_HOST"
  echo "  Порт: $POSTGRESQL_PORT"
  echo "  База данных: $POSTGRESQL_DBNAME"
  echo "  Пользователь: $POSTGRESQL_USER"
fi

# Подготавливаем Docker Compose файлы
COMPOSE_FILES="-f docker-compose.yml"

if [ "$USE_EXTERNAL_DB" == "true" ]; then
  # При использовании внешней БД создадим временный docker-compose.override.yml
  echo "Создаем конфигурацию для внешней базы данных..."
  
  # Экранируем специальные символы в пароле для строки подключения
  # Заменяем специальные символы, которые могут вызвать проблемы
  ESCAPED_PASSWORD=$(echo "$POSTGRESQL_PASSWORD" | sed 's/\\/\\\\/g; s/\$/\\\$/g; s/\@/\\@/g; s/\:/\\:/g')
  
  cat > docker-compose.override.yml <<EOL
services:
  app:
    environment:
      - DATABASE_URL=postgresql://${POSTGRESQL_USER}:${ESCAPED_PASSWORD}@${POSTGRESQL_HOST}:${POSTGRESQL_PORT}/${POSTGRESQL_DBNAME}
EOL
  
  # Не запускаем контейнер PostgreSQL
  cat >> docker-compose.override.yml <<EOL
  postgres:
    profiles:
      - do-not-start
EOL
  
  COMPOSE_FILES="-f docker-compose.yml -f docker-compose.override.yml"
  
  echo "Создан файл docker-compose.override.yml для подключения к внешней базе данных."
fi

# Запуск с пересборкой
echo "Запускаем производственные контейнеры..."
docker compose $COMPOSE_FILES up -d --build

echo "Производственные контейнеры успешно запущены!"
echo "Миграции Prisma будут применены автоматически при запуске контейнера"
echo "Приложение доступно на http://localhost:3000"

if [ "$USE_EXTERNAL_DB" == "true" ]; then
  echo "Используется внешняя база данных: ${POSTGRESQL_HOST}:${POSTGRESQL_PORT}"
else
  echo "PostgreSQL запущен в контейнере finance_postgres"
fi

# Показываем список контейнеров
echo -e "\nСписок запущенных контейнеров:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Инструкции по просмотру таблиц в PostgreSQL
echo -e "\nДля просмотра таблиц PostgreSQL можно использовать команду:"
echo "docker exec -it finance_postgres psql -U finance_user -d finance_db -c '\dt'"
echo "или войти в PostgreSQL интерактивно:"
echo "docker exec -it finance_postgres psql -U finance_user -d finance_db"
echo "и затем выполнить команды:"
echo "\\dt - посмотреть список таблиц"
echo "\\d+ имя_таблицы - посмотреть структуру таблицы"
echo "SELECT * FROM имя_таблицы LIMIT 10; - посмотреть данные таблицы"

echo -e "\nДля проверки статуса миграций Prisma можно использовать команду:"
echo "docker exec -it finance_app npx prisma migrate status"
