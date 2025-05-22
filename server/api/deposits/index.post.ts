import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const { name, amount, initialAmount, interestRate, startDate, endDate, bank, isCapitalized, paymentFrequency, status } = body
    
    const deposit = await prisma.deposit.create({
      data: {
        name,
        amount,
        initialAmount,
        interestRate,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bank,
        isCapitalized,
        paymentFrequency,
        status
      }
    })
    
    return {
      success: true,
      deposit: {
        ...deposit,
        startDate: deposit.startDate.toISOString().split('T')[0],
        endDate: deposit.endDate.toISOString().split('T')[0],
        id: deposit.id.toString()
      }
    }
  } catch (error) {
    console.error('Error creating deposit:', error)
    return { 
      success: false,
      error: 'Ошибка при создании вклада'
    }
  }
})
