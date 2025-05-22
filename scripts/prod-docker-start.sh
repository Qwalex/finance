#!/bin/bash

# Проверяем наличие директории для данных PostgreSQL
if [ ! -d "./postgres-data" ]; then
  echo "Создаем директорию для данных PostgreSQL..."
  mkdir -p ./postgres-data
fi

# Остановка и удаление текущих контейнеров (если существуют)
echo "Останавливаем существующие контейнеры..."
docker-compose down

# Запуск с пересборкой (если нужно)
echo "Запускаем производственные контейнеры..."
docker-compose up -d --build

echo "Производственные контейнеры успешно запущены!"
echo "Миграции Prisma будут применены автоматически при запуске контейнера"
echo "Приложение доступно на http://localhost:3000"
echo "PostgreSQL запущен в контейнере finance_postgres"

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
