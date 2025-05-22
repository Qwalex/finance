import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Извлекаем необходимые поля с учетом значений по умолчанию
    const { value, cat = 'Другое', description, isIncome = false } = body
    
    // Проверка на обязательное поле value
    if (value === undefined || value === null) {
      return {
        success: false,
        error: 'Поле value является обязательным'
      }
    }

    // Преобразуем в числовое значение, если это строка
    const amount = typeof value === 'string' ? parseFloat(value) : value
    
    // Проверка на валидное числовое значение
    if (isNaN(amount)) {
      return {
        success: false,
        error: 'Поле value должно быть числом'
      }
    }

    // Создаем транзакцию
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(), // Текущая дата
        amount,
        category: cat,
        description: description ?? `Внешняя транзакция: ${cat}`,
        type: isIncome ? 'income' : 'expense'
      }
    })
    
    return {
      success: true,
      transaction: {
        id: transaction.id,
        date: transaction.date.toISOString(),
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type
      }
    }
  } catch (error) {
    console.error('Error creating external transaction:', error)
    return { 
      success: false,
      error: 'Ошибка при создании транзакции'
    }
  }
})
