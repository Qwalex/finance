#!/bin/bash

# Скрипт для запуска контейнера с подключением к внешней базе данных
echo "Запуск с подключением к внешней базе данных"

# Проверяем наличие переменной DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "Ошибка: переменная DATABASE_URL не установлена. Установите её в файле .env"
  exit 1
fi

# Запускаем docker-compose с дополнительными настройками для повторных попыток подключения
export MAX_DB_CONNECTION_RETRIES=15
export DB_CONNECTION_RETRY_INTERVAL=5

# Запускаем контейнер
docker-compose up -d

# Выводим логи для мониторинга процесса запуска
docker-compose logs -f app
