# Финансовый учет - Персональное приложение для управления финансами

Это приложение на основе Nuxt.js для учета личных финансов и планирования бюджета. Приложение позволяет отслеживать доходы, расходы, регулярные платежи, задолженности и вклады, а также предоставляет наглядную аналитику и прогнозы.

## Функциональность

- **Панель управления** - обзор финансового состояния с графиками и статистикой
- **Транзакции** - учет всех доходов и расходов
- **Регулярные платежи** - управление повторяющимися платежами и поступлениями
- **Вклады** - управление банковскими вкладами и депозитами, учет полученных процентов
- **Задолженности** - отслеживание долгов и кредитов с расчетом точки безубыточности
- **Отчеты** - подробная аналитика с различными видами графиков для всех разделов

## Технический стек

- **Frontend:** Vue.js 3, Nuxt 3
- **State Management:** Pinia
- **UI Components:** PrimeVue
- **Графики:** Chart.js, Vue-Chart.js
- **Работа с датами:** Moment.js
- **Хранение данных:** Local Storage (в текущей версии)

## Установка и запуск

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
