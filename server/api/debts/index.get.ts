import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const debts = await prisma.debt.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return { 
      debts: debts.map(debt => ({
        ...debt,
        startDate: debt.startDate.toISOString().split('T')[0],
        id: debt.id.toString()
      }))
    }
  } catch (error) {
    console.error('Error fetching debts:', error)
    return { 
      error: 'Ошибка при получении долгов',
      debts: []
    }
  }
})
