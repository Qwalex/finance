import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const { date, amount, category, description, type } = body
    
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        amount,
        category,
        description,
        type
      }
    })
    
    return {
      success: true,
      transaction: {
        ...transaction,
        date: transaction.date.toISOString().split('T')[0],
        id: transaction.id.toString()
      }
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return { 
      success: false,
      error: 'Ошибка при создании транзакции'
    }
  }
})
