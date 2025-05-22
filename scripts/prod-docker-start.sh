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
  
  # Функция для проверки порта на доступность
  check_port() {
    local host=$1
    local port=$2
    local is_windows=false
    
    # Проверяем, работаем ли мы в Windows
    if [[ "$(uname -s)" == MINGW* ]] || [[ "$(uname -s)" == CYGWIN* ]] || [[ -n "$WINDIR" ]]; then
      is_windows=true
      echo "Обнаружена Windows, используем PowerShell для проверки соединения..."
    fi
    
    # В Windows используем PowerShell
    if [ "$is_windows" = true ]; then
      if powershell -Command "Test-NetConnection -ComputerName $host -Port $port -InformationLevel Quiet" > /dev/null 2>&1; then
        return 0 # Порт открыт
      else
        return 1 # Порт закрыт
      fi
    # На Linux/Unix используем стандартные инструменты
    else
      # Проверяем наличие netcat
      if command -v nc >/dev/null 2>&1; then
        if nc -z -w 5 "$host" "$port"; then
          return 0 # Порт открыт
        else
          return 1 # Порт закрыт
        fi
      # Если netcat недоступен, пробуем telnet
      elif command -v telnet >/dev/null 2>&1; then
        if (echo > /dev/tcp/$host/$port) >/dev/null 2>&1; then
          return 0 # Порт открыт
        else
          return 1 # Порт закрыт
        fi
      # Если оба недоступны, считаем порт открытым для продолжения работы
      else
        echo "ВНИМАНИЕ: Утилиты для проверки соединения не найдены, предполагаем что база данных доступна."
        return 0
      fi
    fi
  }
  
  # Проверяем доступность базы данных
  if check_port "$POSTGRESQL_HOST" "$POSTGRESQL_PORT"; then
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
  
  # Используем значение DATABASE_URL из переменной окружения, если оно задано
  if [ -n "$DATABASE_URL" ]; then
    echo "Используем готовый DATABASE_URL из переменных окружения"
    DB_URL="$DATABASE_URL"
  else
    # Делаем URL-кодирование пароля для правильного подключения к PostgreSQL
    # Кодируем все специальные символы для URL
    ENCODED_PASSWORD=$(printf "%s" "$POSTGRESQL_PASSWORD" | xxd -plain | tr -d '\n' | sed 's/\(..\)/%\1/g' | sed 's/%20/+/g' | sed 's/%2F/\//g' | sed 's/%40/@/g' | sed 's/%3A/:/g')
    
    # Для систем, где xxd недоступен, используем простое кодирование основных специальных символов
    if [ -z "$ENCODED_PASSWORD" ]; then
      echo "Используем простое кодирование специальных символов..."
      ENCODED_PASSWORD=$(echo "$POSTGRESQL_PASSWORD" | sed 's/#/%23/g; s/</%3C/g; s/>/%3E/g; s/?/%3F/g; s/&/%26/g; s/=/%3D/g; s/+/%2B/g; s/ /%20/g')
    fi
    
    DB_URL="postgresql://${POSTGRESQL_USER}:${ENCODED_PASSWORD}@${POSTGRESQL_HOST}:${POSTGRESQL_PORT}/${POSTGRESQL_DBNAME}"
  fi
  
  cat > docker-compose.override.yml <<EOL
services:
  app:
    environment:
      - DATABASE_URL=${DB_URL}
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
