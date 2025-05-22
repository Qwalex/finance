import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    const { name, initialAmount, currentAmount, interestRate, minimumPayment, dueDay, startDate } = body
    
    const debt = await prisma.debt.update({
      where: { id },
      data: {
        name,
        initialAmount,
        currentAmount,
        interestRate,
        minimumPayment,
        dueDay,
        startDate: new Date(startDate)
      }
    })
    
    return {
      success: true,
      debt: {
        ...debt,
        startDate: debt.startDate.toISOString().split('T')[0],
        id: debt.id.toString()
      }
    }
  } catch (error) {
    console.error('Error updating debt:', error)
    return { 
      success: false,
      error: 'Ошибка при обновлении долга'
    }
  }
})
