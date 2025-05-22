import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    await prisma.debt.delete({
      where: { id }
    })
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting debt:', error)
    return { 
      success: false,
      error: 'Ошибка при удалении долга'
    }
  }
})
