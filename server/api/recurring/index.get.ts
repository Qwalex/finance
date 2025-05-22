import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const recurringItems = await prisma.recurringItem.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return { 
      recurringItems: recurringItems.map(item => ({
        ...item,
        startDate: item.startDate.toISOString().split('T')[0],
        endDate: item.endDate ? item.endDate.toISOString().split('T')[0] : null,
        id: item.id.toString()
      }))
    }
  } catch (error) {
    console.error('Error fetching recurring items:', error)
    return { 
      error: 'Ошибка при получении периодических платежей',
      recurringItems: []
    }
  }
})
