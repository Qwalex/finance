import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const deposits = await prisma.deposit.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return { 
      deposits: deposits.map(deposit => ({
        ...deposit,
        startDate: deposit.startDate.toISOString().split('T')[0],
        endDate: deposit.endDate.toISOString().split('T')[0],
        id: deposit.id.toString()
      }))
    }
  } catch (error) {
    console.error('Error fetching deposits:', error)
    return { 
      error: 'Ошибка при получении вкладов',
      deposits: []
    }
  }
})
