import prisma from '../../utils/prisma'
import moment from 'moment'

export default defineEventHandler(async (event) => {
  try {
    // Проверим, есть ли уже данные в базе
    const transactionCount = await prisma.transaction.count()
    
    if (transactionCount > 0) {
      return {
        success: false,
        message: 'База данных уже содержит данные'
      }
    }
    
    // Инициализация демо-данных
    const today = moment().format('YYYY-MM-DD')
    const lastMonth = moment().subtract(1, 'month').format('YYYY-MM-DD')
    
    // Транзакции
    const demoTransactions = [
      { date: new Date(today), amount: 100000, category: 'Зарплата', description: 'Зарплата за май', type: 'income' },
      { date: new Date(today), amount: 20000, category: 'Фриланс', description: 'Проект для клиента', type: 'income' },
      { date: new Date(today), amount: 15000, category: 'Жилье', description: 'Оплата аренды', type: 'expense' },
      { date: new Date(today), amount: 5000, category: 'Питание', description: 'Продукты', type: 'expense' },
      { date: new Date(lastMonth), amount: 100000, category: 'Зарплата', description: 'Зарплата за апрель', type: 'income' },
      { date: new Date(lastMonth), amount: 10000, category: 'Развлечения', description: 'Кино и ресторан', type: 'expense' },
    ]
    
    // Повторяющиеся платежи
    const demoRecurringItems = [
      { amount: 100000, description: 'Ежемесячная зарплата', category: 'Зарплата', type: 'income', frequency: 'monthly', startDate: new Date(today) },
      { amount: 15000, description: 'Оплата аренды', category: 'Жилье', type: 'expense', frequency: 'monthly', startDate: new Date(today) },
      { amount: 20000, description: 'Продукты', category: 'Питание', type: 'expense', frequency: 'monthly', startDate: new Date(today) },
      { amount: 5000, description: 'Подписки', category: 'Развлечения', type: 'expense', frequency: 'monthly', startDate: new Date(today) },
    ]
    
    // Долги
    const demoDebts = [
      { 
        name: 'Кредит на автомобиль', 
        initialAmount: 500000, 
        currentAmount: 350000, 
        interestRate: 12, 
        minimumPayment: 15000, 
        dueDay: 15, 
        startDate: new Date(moment().subtract(6, 'months').format('YYYY-MM-DD'))
      },
      { 
        name: 'Кредитная карта', 
        initialAmount: 100000, 
        currentAmount: 80000, 
        interestRate: 18, 
        minimumPayment: 5000, 
        dueDay: 20, 
        startDate: new Date(moment().subtract(3, 'months').format('YYYY-MM-DD'))
      }
    ]
    
    // Вклады
    const demoDeposits = [
      {
        name: 'Накопительный вклад',
        amount: 200000,
        initialAmount: 200000,
        interestRate: 7.5,
        startDate: new Date(moment().subtract(2, 'months').format('YYYY-MM-DD')),
        endDate: new Date(moment().add(10, 'months').format('YYYY-MM-DD')),
        bank: 'Сбербанк',
        isCapitalized: true,
        paymentFrequency: 'monthly',
        status: 'active'
      },
      {
        name: 'Срочный вклад',
        amount: 500000,
        initialAmount: 500000,
        interestRate: 8.2,
        startDate: new Date(moment().subtract(1, 'months').format('YYYY-MM-DD')),
        endDate: new Date(moment().add(12, 'months').format('YYYY-MM-DD')),
        bank: 'ВТБ',
        isCapitalized: false,
        paymentFrequency: 'quarterly',
        status: 'active'
      },
      {
        name: 'Накопительный счет',
        amount: 150000,
        initialAmount: 100000,
        interestRate: 6.5,
        startDate: new Date(moment().subtract(3, 'months').format('YYYY-MM-DD')),
        endDate: new Date(moment().add(9, 'months').format('YYYY-MM-DD')),
        bank: 'Тинькофф',
        isCapitalized: true,
        paymentFrequency: 'monthly',
        status: 'active'
      }
    ]
    
    // Транзакции
    for (const transaction of demoTransactions) {
      await prisma.transaction.create({
        data: transaction
      })
    }
    
    // Повторяющиеся платежи
    for (const recurringItem of demoRecurringItems) {
      await prisma.recurringItem.create({
        data: recurringItem
      })
    }
    
    // Долги
    for (const debt of demoDebts) {
      await prisma.debt.create({
        data: debt
      })
    }
    
    // Вклады
    for (const deposit of demoDeposits) {
      await prisma.deposit.create({
        data: deposit
      })
    }
    
    return {
      success: true,
      message: 'Демо-данные успешно инициализированы'
    }
  } catch (error) {
    console.error('Ошибка при инициализации демо-данных:', error)
    return {
      success: false,
      error: 'Ошибка при инициализации демо-данных'
    }
  }
})
