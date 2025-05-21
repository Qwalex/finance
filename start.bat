@echo off
REM Файл запуска сервера для production в Windows

REM Переменные окружения
set NODE_ENV=production
set PORT=3000

REM Сборка приложения для production
echo Building application for production...
call npm run build

REM Запуск приложения
echo Starting server...
call npm run start
