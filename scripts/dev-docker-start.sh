#!/bin/bash

# Остановка и удаление текущих контейнеров (если существуют)
echo "Останавливаем существующие контейнеры..."
docker-compose -f docker-compose.dev.yml down

# Запуск с пересборкой (если нужно)
echo "Запускаем контейнеры разработки..."
docker-compose -f docker-compose.dev.yml up -d

echo "Контейнеры разработки успешно запущены!"
echo "PostgreSQL доступен на localhost:5433"
echo "Имя пользователя: postgres"
echo "Пароль: postgres"
echo "База данных: finance_db"

# Показываем список контейнеров
echo -e "\nСписок запущенных контейнеров:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Инструкции по просмотру таблиц в PostgreSQL
echo -e "\nДля просмотра таблиц PostgreSQL можно использовать команду:"
echo "docker exec -it finance_dev_postgres psql -U postgres -d finance_db -c '\dt'"
echo "или войти в PostgreSQL интерактивно:"
echo "docker exec -it finance_dev_postgres psql -U postgres -d finance_db"
echo "и затем выполнить команды:"
echo "\\dt - посмотреть список таблиц"
echo "\\d+ имя_таблицы - посмотреть структуру таблицы"
echo "SELECT * FROM имя_таблицы LIMIT 10; - посмотреть данные таблицы"
