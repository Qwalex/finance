import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const { amount, description, category, type, frequency, startDate, endDate } = body
    
    const recurringItem = await prisma.recurringItem.create({
      data: {
        amount,
        description,
        category,
        type,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      }
    })
    
    return {
      success: true,
      recurringItem: {
        ...recurringItem,
        startDate: recurringItem.startDate.toISOString().split('T')[0],
        endDate: recurringItem.endDate ? recurringItem.endDate.toISOString().split('T')[0] : null,
        id: recurringItem.id.toString()
      }
    }
  } catch (error) {
    console.error('Error creating recurring item:', error)
    return { 
      success: false,
      error: 'Ошибка при создании периодического платежа'
    }
  }
})
