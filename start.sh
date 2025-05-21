# Файл запуска сервера для production
# Требуется установить PM2: npm install -g pm2

# Переменные окружения
export NODE_ENV=production
export PORT=3000

# Переходим в директорию проекта
cd "$(dirname "$0")"

# Запуск приложения с помощью PM2
pm2 start npm --name "finance-app" -- start
