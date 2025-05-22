import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id, amount } = body
    
    // Получаем текущий долг
    const debt = await prisma.debt.findUnique({
      where: { id }
    })
    
    if (!debt) {
      return {
        success: false,
        error: 'Долг не найден'
      }
    }
    
    // Обновляем сумму долга
    const updatedDebt = await prisma.debt.update({
      where: { id },
      data: {
        currentAmount: Math.max(0, debt.currentAmount - amount)
      }
    })
    
    // Создаем транзакцию платежа
    await prisma.transaction.create({
      data: {
        date: new Date(),
        amount,
        category: 'Долги',
        description: `Платеж по долгу: ${debt.name}`,
        type: 'expense'
      }
    })
    
    return {
      success: true,
      debt: {
        ...updatedDebt,
        startDate: updatedDebt.startDate.toISOString().split('T')[0],
        id: updatedDebt.id.toString()
      }
    }
  } catch (error) {
    console.error('Error making debt payment:', error)
    return { 
      success: false,
      error: 'Ошибка при совершении платежа по долгу'
    }
  }
})
