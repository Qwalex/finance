# Dockerfile
FROM node:22-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

# Собираем приложение для production
RUN npm run build

# Копируем скрипты и делаем их исполняемыми
COPY scripts/docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Выставляем порт
EXPOSE 3000

# Запускаем приложение
CMD [ "/app/docker-entrypoint.sh" ]
