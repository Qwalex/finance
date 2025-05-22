import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc'
      }
    })
    
    return { 
      transactions: transactions.map(transaction => ({
        ...transaction,
        date: transaction.date.toISOString().split('T')[0], // Форматируем дату
        id: transaction.id.toString()
      }))
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { 
      error: 'Ошибка при получении транзакций',
      transactions: []
    }
  }
})
