# Руководство пользователя - Финансовый учет

## Введение

Приложение "Финансовый учет" - это инструмент для управления личными финансами. Оно позволяет отслеживать доходы и расходы, управлять регулярными платежами, фиксировать задолженности, управлять вкладами и анализировать ваши финансы с помощью наглядных графиков и отчетов.

## Начало работы

1. Откройте приложение в браузере (http://localhost:3000/)
2. При первом запуске приложение загрузит демонстрационные данные для ознакомления с функциональностью
3. Для навигации используйте меню в верхней части экрана

## Основные функции

### Панель управления

Здесь представлена общая информация о вашем финансовом состоянии:

- Общий баланс
- Доходы и расходы за текущий месяц
- Чистый месячный доход
- Информация о вкладах и полученных процентах
- Информация о задолженностях
- График доходов и расходов по месяцам
- Структура расходов по категориям
- Структура активов (при наличии вкладов)

### Транзакции

В этом разделе вы можете:

- Просматривать все ваши доходы и расходы
- Добавлять новые транзакции
- Редактировать существующие транзакции
- Удалять транзакции
- Фильтровать транзакции по дате, типу, категории и описанию

Для добавления новой транзакции:

1. Нажмите кнопку "Добавить транзакцию"
2. Выберите тип транзакции (доход или расход)
3. Укажите дату, сумму и категорию
4. Введите описание
5. Нажмите "Сохранить"

### Регулярные платежи

Здесь вы можете управлять повторяющимися доходами и расходами:

- Просматривать регулярные доходы и расходы на отдельных вкладках
- Добавлять новые регулярные платежи
- Редактировать существующие платежи
- Удалять платежи

Для добавления нового регулярного платежа:

1. Нажмите кнопку "Добавить платеж"
2. Выберите тип (доход или расход)
3. Укажите описание, сумму и категорию
4. Выберите частоту платежа (ежедневно, еженедельно, ежемесячно, ежегодно)
5. Укажите дату начала и, при необходимости, дату окончания
6. Нажмите "Сохранить"

### Задолженности

В этом разделе вы можете управлять вашими долгами и кредитами:

- Просматривать все ваши задолженности
- Добавлять новые долги
- Редактировать существующие долги
- Удалять долги
- Вносить платежи по долгам

Для добавления нового долга:

1. Нажмите кнопку "Добавить долг"
2. Укажите название, начальную и текущую суммы
3. Введите процентную ставку и минимальный платеж
4. Укажите день платежа и дату начала
5. Нажмите "Сохранить"

Для внесения платежа по долгу:

1. Найдите нужный долг в списке
2. Нажмите кнопку "Внести платеж"
3. Укажите сумму платежа
4. Нажмите "Внести платеж"

### Вклады

В этом разделе вы можете управлять банковскими вкладами и депозитами:

- Просматривать активные и закрытые вклады
- Добавлять новые вклады
- Редактировать параметры существующих вкладов
- Начислять проценты по вкладам
- Закрывать вклады по окончании срока
- Удалять вклады
- Просматривать аналитику по вкладам

Для добавления нового вклада:

1. Нажмите кнопку "Добавить вклад"
2. Укажите название вклада и банк
3. Введите начальную сумму и процентную ставку
4. Укажите дату открытия и окончания вклада
5. Выберите частоту выплаты процентов (ежемесячно, ежеквартально, ежегодно, в конце срока)
6. При необходимости отметьте капитализацию процентов
7. Нажмите "Сохранить"

Для начисления процентов по вкладу:

1. Найдите нужный вклад в списке
2. Нажмите кнопку начисления процентов (иконка с плюсом)
3. Укажите сумму процентов для начисления
4. Нажмите "Начислить"

Для закрытия вклада:

1. Найдите нужный вклад в списке
2. Нажмите кнопку закрытия вклада (иконка с галочкой)
3. Укажите итоговую сумму закрытия
4. Нажмите "Закрыть вклад"

### Отчеты

В этом разделе представлена аналитика ваших финансов:

- Графики доходов и расходов по месяцам
- Структура расходов по категориям
- Аналитика по вкладам и общим активам
- Тренды финансовых показателей
- Прогнозы будущего финансового состояния

## Хранение данных

Все данные хранятся локально в вашем браузере (localStorage). Это означает, что:

- Данные не передаются на сервер
- Доступ к данным возможен только с вашего устройства
- При очистке данных браузера данные приложения будут удалены

## Интеграция с другими сервисами

Приложение предоставляет внешний API для интеграции с другими сервисами.

### Внешний API для транзакций

Вы можете добавлять транзакции из внешних систем с помощью API-эндпоинта:
- URL: `POST /api/external/transaction`
- Требуется API-ключ в заголовке запроса `x-api-key`
- Поддерживает добавление как доходов, так и расходов

Подробная документация доступна в файле `API_DOCS.md`.

## Техническая поддержка

Если у вас возникли вопросы или проблемы при использовании приложения, пожалуйста, обратитесь в службу поддержки по адресу: support@finance-app.example.com
