// Тесты для внешнего API
import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

describe('External Transaction API', () => {
  const apiKey = 'test-api-key'
  
  it('should create an expense transaction with minimum parameters', async () => {
    const response = await $fetch('/api/external/transaction', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      },
      body: {
        value: 5000
      }
    })
    
    expect(response.success).toBe(true)
    expect(response.transaction).toBeDefined()
    expect(response.transaction.amount).toBe(5000)
    expect(response.transaction.category).toBe('Другое')
    expect(response.transaction.type).toBe('expense')
  })
  
  it('should create an income transaction with all parameters', async () => {
    const response = await $fetch('/api/external/transaction', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      },
      body: {
        value: 10000,
        cat: 'Зарплата',
        isIncome: true
      }
    })
    
    expect(response.success).toBe(true)
    expect(response.transaction).toBeDefined()
    expect(response.transaction.amount).toBe(10000)
    expect(response.transaction.category).toBe('Зарплата')
    expect(response.transaction.type).toBe('income')
  })
  
  it('should fail without value parameter', async () => {
    const response = await $fetch('/api/external/transaction', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      },
      body: {
        cat: 'Продукты'
      }
    })
    
    expect(response.success).toBe(false)
    expect(response.error).toContain('value')
  })
  
  it('should fail with non-numeric value', async () => {
    const response = await $fetch('/api/external/transaction', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      },
      body: {
        value: 'не число'
      }
    })
    
    expect(response.success).toBe(false)
    expect(response.error).toContain('должно быть числом')
  })
  
  it('should fail with invalid API key', async () => {
    try {
      await $fetch('/api/external/transaction', {
        method: 'POST',
        headers: {
          'x-api-key': 'неверный-ключ'
        },
        body: {
          value: 1000
        }
      })
      // Должны получить ошибку
      expect(true).toBe(false)
    } catch (error) {
      expect(error.response.status).toBe(401)
    }
  })
})
