import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    await prisma.transaction.delete({
      where: { id }
    })
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { 
      success: false,
      error: 'Ошибка при удалении транзакции'
    }
  }
})
