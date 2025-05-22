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

# Копируем скрипт docker-entrypoint.sh
COPY scripts/docker-entrypoint.sh /app/docker-entrypoint.sh
# Делаем скрипт исполняемым и конвертируем в Unix-формат (для избежания проблем с переносами строк)
RUN chmod +x /app/docker-entrypoint.sh && \
    if command -v dos2unix > /dev/null; then dos2unix /app/docker-entrypoint.sh; \
    else sed -i 's/\r$//' /app/docker-entrypoint.sh; fi

# Выставляем порт
EXPOSE 3000

# Запускаем приложение
CMD [ "sh", "/app/docker-entrypoint.sh" ]
