#!/bin/sh

# Загружаем переменные окружения из файла .env, если он существует
if [ -f ".env" ]; then
  echo "Загружаем переменные окружения из файла .env..."
  while IFS= read -r line || [ -n "$line" ]; do
    # Пропускаем комментарии и пустые строки
    case $line in
      \#*|'') continue ;;
    esac
    export "$line"
  done < .env
fi

# Проверка использования внешней или локальной БД
if [ "$1" = "--external-db" ] || [ "$EXTERNAL_DB" = "true" ]; then
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
docker-compose down

# Здесь остальной код скрипта...

# Запуск с пересборкой
echo "Запускаем производственные контейнеры..."
docker-compose $COMPOSE_FILES up -d --build