import { defineStore } from 'pinia';
import moment from 'moment';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
}

export interface RecurringItem {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
}

export interface Debt {
  id: string;
  name: string;
  initialAmount: number;
  currentAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDay: number;
  startDate: string;
}

export interface Deposit {
  id: string;
  name: string;
  amount: number;
  initialAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  bank: string;
  isCapitalized: boolean;
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly' | 'atMaturity';
  status: 'active' | 'closed';
}

// Тип состояния хранилища
interface FinanceState {
  transactions: Transaction[];
  recurringItems: RecurringItem[];
  debts: Debt[];
  deposits: Deposit[];
  categories: {
    income: string[];
    expense: string[];
  };
  isLoading: {
    transactions: boolean;
    recurringItems: boolean;
    debts: boolean;
    deposits: boolean;
  };
}

export const useFinanceStore = defineStore('finance', {
  state: (): FinanceState => ({
    transactions: [] as Transaction[],
    recurringItems: [] as RecurringItem[],
    debts: [] as Debt[],
    deposits: [] as Deposit[],
    categories: {
      income: ['Зарплата', 'Фриланс', 'Инвестиции', 'Подарки', 'Проценты по вкладам', 'Другое'],
      expense: ['Жилье', 'Питание', 'Транспорт', 'Развлечения', 'Здоровье', 'Образование', 'Одежда', 'Путешествия', 'Другое']
    },
    isLoading: {
      transactions: false,
      recurringItems: false,
      debts: false,
      deposits: false
    }
  }),
  
  getters: {
    totalBalance(state: FinanceState): number {
      return state.transactions.reduce((sum: number, transaction: Transaction) => {
        return transaction.type === 'income' 
          ? sum + transaction.amount 
          : sum - transaction.amount;
      }, 0);
    },
    
    monthlyIncome(state: FinanceState): number {
      const currentMonth = moment().format('YYYY-MM');
      return state.transactions
        .filter((t: Transaction) => t.type === 'income' && moment(t.date).format('YYYY-MM') === currentMonth)
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    },
    
    monthlyExpense(state: FinanceState): number {
      const currentMonth = moment().format('YYYY-MM');
      return state.transactions
        .filter((t: Transaction) => t.type === 'expense' && moment(t.date).format('YYYY-MM') === currentMonth)
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    },
    
    totalDebt(state: FinanceState): number {
      return state.debts.reduce((sum: number, debt: Debt) => sum + debt.currentAmount, 0);
    },
      monthlyRecurringIncome(state: FinanceState): number {
      return state.recurringItems
        .filter((item: RecurringItem) => item.type === 'income' && item.frequency === 'monthly')
        .reduce((sum: number, item: RecurringItem) => sum + item.amount, 0);
    },
    
    monthlyRecurringExpense(state: FinanceState): number {
      return state.recurringItems
        .filter((item: RecurringItem) => item.type === 'expense' && item.frequency === 'monthly')
        .reduce((sum: number, item: RecurringItem) => sum + item.amount, 0);
    },
      monthlyNet(state: FinanceState): number {
      const income = state.recurringItems
        .filter((item: RecurringItem) => item.type === 'income' && item.frequency === 'monthly')
        .reduce((sum: number, item: RecurringItem) => sum + item.amount, 0);
        
      const expense = state.recurringItems
        .filter((item: RecurringItem) => item.type === 'expense' && item.frequency === 'monthly')
        .reduce((sum: number, item: RecurringItem) => sum + item.amount, 0);
        
      return income - expense;
    },
    
    breakEvenPoint(): string | null {
      if (this.totalDebt <= 0 || this.monthlyNet <= 0) {
        return null;
      }
      
      const monthsToBreakEven = Math.ceil(this.totalDebt / this.monthlyNet);
      return moment().add(monthsToBreakEven, 'months').format('MMMM YYYY');
    },
    
    transactionsByMonth(state: FinanceState) {
      const grouped = {} as Record<string, { income: number, expense: number }>;
      
      state.transactions.forEach((transaction: Transaction) => {
        const month = moment(transaction.date).format('YYYY-MM');
        
        if (!grouped[month]) {
          grouped[month] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
          grouped[month].income += transaction.amount;
        } else {
          grouped[month].expense += transaction.amount;
        }
      });
      
      return Object.entries(grouped)
        .map(([month, data]) => ({
          month,
          income: data.income,
          expense: data.expense,
          net: data.income - data.expense
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    },
    
    expensesByCategory(state: FinanceState) {
      const currentMonth = moment().format('YYYY-MM');
      const grouped = {} as Record<string, number>;
      
      state.transactions
        .filter((t: Transaction) => t.type === 'expense' && moment(t.date).format('YYYY-MM') === currentMonth)
        .forEach((transaction: Transaction) => {
          if (!grouped[transaction.category]) {
            grouped[transaction.category] = 0;
          }
          grouped[transaction.category] += transaction.amount;
        });
      
      return Object.entries(grouped).map(([category, amount]) => ({
        category,
        amount
      }));
    },
    
    totalDeposits(state: FinanceState): number {
      return state.deposits
        .filter((deposit: Deposit) => deposit.status === 'active')
        .reduce((sum: number, deposit: Deposit) => sum + deposit.amount, 0);
    },
    
    totalDepositInterest(state: FinanceState): number {
      return state.deposits
        .filter((deposit: Deposit) => deposit.status === 'active')
        .reduce((sum: number, deposit: Deposit) => {
          const initialAmount = deposit.initialAmount;
          const currentAmount = deposit.amount;
          return sum + (currentAmount - initialAmount);
        }, 0);
    },
    
    activeDeposits(state: FinanceState): Deposit[] {
      return state.deposits.filter((deposit: Deposit) => deposit.status === 'active');
    },
    
    upcomingMaturityDeposits(state: FinanceState): Deposit[] {
      const threeMonthsFromNow = moment().add(3, 'months').format('YYYY-MM-DD');
      return state.deposits
        .filter((deposit: Deposit) => deposit.status === 'active' && deposit.endDate <= threeMonthsFromNow)
        .sort((a: Deposit, b: Deposit) => a.endDate.localeCompare(b.endDate));
    },
    
    depositsByBank(state: FinanceState) {
      const grouped = {} as Record<string, number>;
      
      state.deposits
        .filter((deposit: Deposit) => deposit.status === 'active')
        .forEach((deposit: Deposit) => {
          if (!grouped[deposit.bank]) {
            grouped[deposit.bank] = 0;
          }
          grouped[deposit.bank] += deposit.amount;
        });
      
      // Вычисляем общую сумму вкладов напрямую
      const total = state.deposits
        .filter((deposit: Deposit) => deposit.status === 'active')
        .reduce((sum: number, deposit: Deposit) => sum + deposit.amount, 0);
      
      return Object.entries(grouped).map(([bank, amount]) => ({
        bank,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }));
    },
    
    totalAssets(): number {
      return this.totalBalance + this.totalDeposits;
    },
    
    netWorth(): number {
      return this.totalAssets - this.totalDebt;
    }
  },
    actions: {
    // === ТРАНЗАКЦИИ ===
    async fetchTransactions() {
      this.isLoading.transactions = true;
      try {
        const response = await fetch('/api/transactions');
        const data = await response.json();
        if (data.transactions) {
          this.transactions = data.transactions;
        }
      } catch (error) {
        console.error('Ошибка при загрузке транзакций:', error);
      } finally {
        this.isLoading.transactions = false;
      }
    },
    
    async addTransaction(transaction: Omit<Transaction, 'id'>) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        });
        const data = await response.json();
        if (data.success && data.transaction) {
          this.transactions.push(data.transaction);
          this.transactions.sort((a, b) => b.date.localeCompare(a.date)); // Сортировка по дате (по убыванию)
        }
        return data;
      } catch (error) {
        console.error('Ошибка при добавлении транзакции:', error);
        return { success: false, error: 'Ошибка при добавлении транзакции' };
      }
    },
    
    async updateTransaction(transaction: Transaction) {
      try {
        const response = await fetch(`/api/transactions/${transaction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        });
        const data = await response.json();
        if (data.success && data.transaction) {
          const index = this.transactions.findIndex(t => t.id === transaction.id);
          if (index !== -1) {
            this.transactions[index] = data.transaction;
          }
        }
        return data;
      } catch (error) {
        console.error('Ошибка при обновлении транзакции:', error);
        return { success: false, error: 'Ошибка при обновлении транзакции' };
      }
    },
    
    async deleteTransaction(id: string) {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          this.transactions = this.transactions.filter(t => t.id !== id);
        }
        return data;
      } catch (error) {
        console.error('Ошибка при удалении транзакции:', error);
        return { success: false, error: 'Ошибка при удалении транзакции' };
      }
    },
    
    // === ПОВТОРЯЮЩИЕСЯ ПЛАТЕЖИ ===
    async fetchRecurringItems() {
      this.isLoading.recurringItems = true;
      try {
        const response = await fetch('/api/recurring');
        const data = await response.json();
        if (data.recurringItems) {
          this.recurringItems = data.recurringItems;
        }
      } catch (error) {
        console.error('Ошибка при загрузке повторяющихся платежей:', error);
      } finally {
        this.isLoading.recurringItems = false;
      }
    },
    
    async addRecurringItem(item: Omit<RecurringItem, 'id'>) {
      try {
        const response = await fetch('/api/recurring', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });
        const data = await response.json();
        if (data.success && data.recurringItem) {
          this.recurringItems.push(data.recurringItem);
        }
        return data;
      } catch (error) {
        console.error('Ошибка при добавлении повторяющегося платежа:', error);
        return { success: false, error: 'Ошибка при добавлении повторяющегося платежа' };
      }
    },
    
    async updateRecurringItem(item: RecurringItem) {
      try {
        const response = await fetch(`/api/recurring/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });
        const data = await response.json();
        if (data.success && data.recurringItem) {
          const index = this.recurringItems.findIndex(i => i.id === item.id);
          if (index !== -1) {
            this.recurringItems[index] = data.recurringItem;
          }
        }
        return data;
      } catch (error) {
        console.error('Ошибка при обновлении повторяющегося платежа:', error);
        return { success: false, error: 'Ошибка при обновлении повторяющегося платежа' };
      }
    },
    
    async deleteRecurringItem(id: string) {
      try {
        const response = await fetch(`/api/recurring/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          this.recurringItems = this.recurringItems.filter(i => i.id !== id);
        }
        return data;
      } catch (error) {
        console.error('Ошибка при удалении повторяющегося платежа:', error);
        return { success: false, error: 'Ошибка при удалении повторяющегося платежа' };
      }
    },
    
    // === ДОЛГИ ===
    async fetchDebts() {
      this.isLoading.debts = true;
      try {
        const response = await fetch('/api/debts');
        const data = await response.json();
        if (data.debts) {
          this.debts = data.debts;
        }
      } catch (error) {
        console.error('Ошибка при загрузке долгов:', error);
      } finally {
        this.isLoading.debts = false;
      }
    },
    
    async addDebt(debt: Omit<Debt, 'id'>) {
      try {
        const response = await fetch('/api/debts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(debt),
        });
        const data = await response.json();
        if (data.success && data.debt) {
          this.debts.push(data.debt);
        }
        return data;
      } catch (error) {
        console.error('Ошибка при добавлении долга:', error);
        return { success: false, error: 'Ошибка при добавлении долга' };
      }
    },
    
    async updateDebt(debt: Debt) {
      try {
        const response = await fetch(`/api/debts/${debt.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(debt),
        });
        const data = await response.json();
        if (data.success && data.debt) {
          const index = this.debts.findIndex(d => d.id === debt.id);
          if (index !== -1) {
            this.debts[index] = data.debt;
          }
        }
        return data;
      } catch (error) {
        console.error('Ошибка при обновлении долга:', error);
        return { success: false, error: 'Ошибка при обновлении долга' };
      }
    },
    
    async deleteDebt(id: string) {
      try {
        const response = await fetch(`/api/debts/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          this.debts = this.debts.filter(d => d.id !== id);
        }
        return data;
      } catch (error) {
        console.error('Ошибка при удалении долга:', error);
        return { success: false, error: 'Ошибка при удалении долга' };
      }
    },
    
    async makeDebtPayment(id: string, amount: number) {
      try {
        const response = await fetch('/api/debts/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ debtId: id, amount }),
        });
        const data = await response.json();
        if (data.success && data.debt) {
          const index = this.debts.findIndex(d => d.id === id);
          if (index !== -1) {
            this.debts[index] = data.debt;
          }
          
          // Обновим транзакции после внесения платежа
          await this.fetchTransactions();
        }
        return data;
      } catch (error) {
        console.error('Ошибка при внесении платежа по долгу:', error);
        return { success: false, error: 'Ошибка при внесении платежа по долгу' };
      }
    },
    
    // === ВКЛАДЫ ===
    async fetchDeposits() {
      this.isLoading.deposits = true;
      try {
        const response = await fetch('/api/deposits');
        const data = await response.json();
        if (data.deposits) {
          this.deposits = data.deposits;
        }
      } catch (error) {
        console.error('Ошибка при загрузке вкладов:', error);
      } finally {
        this.isLoading.deposits = false;
      }
    },
    
    async addDeposit(deposit: Omit<Deposit, 'id'>) {
      try {
        const response = await fetch('/api/deposits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deposit),
        });
        const data = await response.json();
        if (data.success && data.deposit) {
          this.deposits.push(data.deposit);
        }
        return data;
      } catch (error) {
        console.error('Ошибка при добавлении вклада:', error);
        return { success: false, error: 'Ошибка при добавлении вклада' };
      }
    },
    
    async updateDeposit(deposit: Deposit) {
      try {
        const response = await fetch(`/api/deposits/${deposit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deposit),
        });
        const data = await response.json();
        if (data.success && data.deposit) {
          const index = this.deposits.findIndex(d => d.id === deposit.id);
          if (index !== -1) {
            this.deposits[index] = data.deposit;
          }
        }
        return data;
      } catch (error) {
        console.error('Ошибка при обновлении вклада:', error);
        return { success: false, error: 'Ошибка при обновлении вклада' };
      }
    },
    
    async deleteDeposit(id: string) {
      try {
        const response = await fetch(`/api/deposits/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          this.deposits = this.deposits.filter(d => d.id !== id);
        }
        return data;
      } catch (error) {
        console.error('Ошибка при удалении вклада:', error);
        return { success: false, error: 'Ошибка при удалении вклада' };
      }
    },
    
    async closeDeposit(id: string, closeAmount: number) {
      try {
        const response = await fetch(`/api/deposits/${id}/close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ closeAmount }),
        });
        const data = await response.json();
        if (data.success && data.deposit) {
          const index = this.deposits.findIndex(d => d.id === id);
          if (index !== -1) {
            this.deposits[index] = data.deposit;
          }
          
          // Обновим транзакции после закрытия вклада
          await this.fetchTransactions();
        }
        return data;
      } catch (error) {
        console.error('Ошибка при закрытии вклада:', error);
        return { success: false, error: 'Ошибка при закрытии вклада' };
      }
    },
    
    async addInterestPayment(id: string, amount: number) {
      try {
        const depositIndex = this.deposits.findIndex(d => d.id === id);
        if (depositIndex === -1) {
          return { success: false, error: 'Вклад не найден' };
        }
        
        const deposit = this.deposits[depositIndex];
        const updatedDeposit = {
          ...deposit,
          amount: deposit.amount + amount
        };
        
        // Обновляем данные вклада
        const updateResult = await this.updateDeposit(updatedDeposit);
        if (!updateResult.success) {
          return updateResult;
        }
        
        // Добавляем транзакцию
        await this.addTransaction({
          date: moment().format('YYYY-MM-DD'),
          amount,
          category: 'Проценты по вкладам',
          description: `Проценты по вкладу: ${deposit.name}`,
          type: 'income'
        });
        
        return { success: true };
      } catch (error) {
        console.error('Ошибка при начислении процентов:', error);
        return { success: false, error: 'Ошибка при начислении процентов' };
      }
    },
    
    // === ЗАГРУЗКА ДАННЫХ ===
    async loadData() {
      // Загружаем все данные из API
      await Promise.all([
        this.fetchTransactions(),
        this.fetchRecurringItems(),
        this.fetchDebts(),
        this.fetchDeposits()
      ]);
    },    async loadDemoData() {
      // Загрузка демонстрационных данных
      const today = moment().format('YYYY-MM-DD');
      const lastMonth = moment().subtract(1, 'month').format('YYYY-MM-DD');
      
      // Транзакции
      const demoTransactions: Omit<Transaction, 'id'>[] = [
        { date: today, amount: 100000, category: 'Зарплата', description: 'Зарплата за май', type: 'income' },
        { date: today, amount: 20000, category: 'Фриланс', description: 'Проект для клиента', type: 'income' },
        { date: today, amount: 15000, category: 'Жилье', description: 'Оплата аренды', type: 'expense' },
        { date: today, amount: 5000, category: 'Питание', description: 'Продукты', type: 'expense' },
        { date: lastMonth, amount: 100000, category: 'Зарплата', description: 'Зарплата за апрель', type: 'income' },
        { date: lastMonth, amount: 10000, category: 'Развлечения', description: 'Кино и ресторан', type: 'expense' },
      ];
      
      // Повторяющиеся платежи
      const demoRecurringItems: Omit<RecurringItem, 'id'>[] = [
        { amount: 100000, description: 'Ежемесячная зарплата', category: 'Зарплата', type: 'income', frequency: 'monthly', startDate: today },
        { amount: 15000, description: 'Оплата аренды', category: 'Жилье', type: 'expense', frequency: 'monthly', startDate: today },
        { amount: 20000, description: 'Продукты', category: 'Питание', type: 'expense', frequency: 'monthly', startDate: today },
        { amount: 5000, description: 'Подписки', category: 'Развлечения', type: 'expense', frequency: 'monthly', startDate: today },
      ];
      
      // Долги
      const demoDebts: Omit<Debt, 'id'>[] = [
        { 
          name: 'Кредит на автомобиль', 
          initialAmount: 500000, 
          currentAmount: 350000, 
          interestRate: 12, 
          minimumPayment: 15000, 
          dueDay: 15, 
          startDate: moment().subtract(6, 'months').format('YYYY-MM-DD') 
        },
        { 
          name: 'Кредитная карта', 
          initialAmount: 100000, 
          currentAmount: 80000, 
          interestRate: 18, 
          minimumPayment: 5000, 
          dueDay: 20, 
          startDate: moment().subtract(3, 'months').format('YYYY-MM-DD') 
        }
      ];
      
      // Вклады
      const demoDeposits: Omit<Deposit, 'id'>[] = [
        {
          name: 'Накопительный вклад',
          amount: 200000,
          initialAmount: 200000,
          interestRate: 7.5,
          startDate: moment().subtract(2, 'months').format('YYYY-MM-DD'),
          endDate: moment().add(10, 'months').format('YYYY-MM-DD'),
          bank: 'Сбербанк',
          isCapitalized: true,
          paymentFrequency: 'monthly',
          status: 'active'
        },
        {
          name: 'Срочный вклад',
          amount: 500000,
          initialAmount: 500000,
          interestRate: 8.2,
          startDate: moment().subtract(1, 'months').format('YYYY-MM-DD'),
          endDate: moment().add(12, 'months').format('YYYY-MM-DD'),
          bank: 'ВТБ',
          isCapitalized: false,
          paymentFrequency: 'quarterly',
          status: 'active'
        },
        {
          name: 'Накопительный счет',
          amount: 150000,
          initialAmount: 100000,
          interestRate: 6.5,
          startDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
          endDate: moment().add(9, 'months').format('YYYY-MM-DD'),
          bank: 'Тинькофф',
          isCapitalized: true,
          paymentFrequency: 'monthly',
          status: 'active'
        }
      ];
      
      // Выполняем последовательное добавление данных
      for (const transaction of demoTransactions) {
        await this.addTransaction(transaction);
      }
      
      for (const recurringItem of demoRecurringItems) {
        await this.addRecurringItem(recurringItem);
      }
      
      for (const debt of demoDebts) {
        await this.addDebt(debt);
      }
      
      for (const deposit of demoDeposits) {
        await this.addDeposit(deposit);
      }
    }
  }
});
