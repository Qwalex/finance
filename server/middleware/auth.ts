export default defineEventHandler((event) => {
  // Проверяем, является ли текущий маршрут внешним API
  if (event.path.startsWith('/api/external')) {
    // Получаем API-ключ из заголовка
    const apiKey = getRequestHeader(event, 'x-api-key')
    
    // Получаем API-ключ из .env или устанавливаем значение по умолчанию для разработки
    const validApiKey = process.env.EXTERNAL_API_KEY || 'finance-app-external-api-key'
    
    // Проверяем API-ключ
    if (!apiKey || apiKey !== validApiKey) {
      return createError({
        statusCode: 401,
        statusMessage: 'Неверный API-ключ'
      })
    }
  }
})
