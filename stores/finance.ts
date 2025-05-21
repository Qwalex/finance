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

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    transactions: [] as Transaction[],
    recurringItems: [] as RecurringItem[],
    debts: [] as Debt[],
    deposits: [] as Deposit[],
    categories: {
      income: ['Зарплата', 'Фриланс', 'Инвестиции', 'Подарки', 'Проценты по вкладам', 'Другое'],
      expense: ['Жилье', 'Питание', 'Транспорт', 'Развлечения', 'Здоровье', 'Образование', 'Одежда', 'Путешествия', 'Другое']
    }
  }),  getters: {
    totalBalance: (state) => {
      return state.transactions.reduce((sum, transaction) => {
        return transaction.type === 'income' 
          ? sum + transaction.amount 
          : sum - transaction.amount;
      }, 0);
    },
    monthlyIncome: (state) => {
      const currentMonth = moment().format('YYYY-MM');
      return state.transactions
        .filter(t => t.type === 'income' && moment(t.date).format('YYYY-MM') === currentMonth)
        .reduce((sum, t) => sum + t.amount, 0);
    },
    monthlyExpense: (state) => {
      const currentMonth = moment().format('YYYY-MM');
      return state.transactions
        .filter(t => t.type === 'expense' && moment(t.date).format('YYYY-MM') === currentMonth)
        .reduce((sum, t) => sum + t.amount, 0);
    },
    totalDebt: (state) => {
      return state.debts.reduce((sum, debt) => sum + debt.currentAmount, 0);
    },
    monthlyRecurringIncome: (state) => {
      return state.recurringItems
        .filter(item => item.type === 'income' && item.frequency === 'monthly')
        .reduce((sum, item) => sum + item.amount, 0);
    },
    monthlyRecurringExpense: (state) => {
      return state.recurringItems
        .filter(item => item.type === 'expense' && item.frequency === 'monthly')
        .reduce((sum, item) => sum + item.amount, 0);
    },
    monthlyNet(): number {
      return this.monthlyRecurringIncome - this.monthlyRecurringExpense;
    },
    breakEvenPoint(): string | null {
      if (this.totalDebt <= 0 || this.monthlyNet <= 0) {
        return null;
      }
      
      const monthsToBreakEven = Math.ceil(this.totalDebt / this.monthlyNet);
      return moment().add(monthsToBreakEven, 'months').format('MMMM YYYY');
    },
    transactionsByMonth() {
      const grouped = {} as Record<string, { income: number, expense: number }>;
      
      this.transactions.forEach(transaction => {
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
    expensesByCategory() {
      const currentMonth = moment().format('YYYY-MM');
      const grouped = {} as Record<string, number>;
      
      this.transactions
        .filter(t => t.type === 'expense' && moment(t.date).format('YYYY-MM') === currentMonth)
        .forEach(transaction => {
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
    totalDeposits(): number {
      return this.deposits
        .filter(deposit => deposit.status === 'active')
        .reduce((sum, deposit) => sum + deposit.amount, 0);
    },
    totalDepositInterest(): number {
      return this.deposits
        .filter(deposit => deposit.status === 'active')
        .reduce((sum, deposit) => {
          const initialAmount = deposit.initialAmount;
          const currentAmount = deposit.amount;
          return sum + (currentAmount - initialAmount);
        }, 0);
    },
    activeDeposits(): Deposit[] {
      return this.deposits.filter(deposit => deposit.status === 'active');
    },
    upcomingMaturityDeposits(): Deposit[] {
      const threeMonthsFromNow = moment().add(3, 'months').format('YYYY-MM-DD');
      return this.deposits
        .filter(deposit => deposit.status === 'active' && deposit.endDate <= threeMonthsFromNow)
        .sort((a, b) => a.endDate.localeCompare(b.endDate));
    },
    depositsByBank() {
      const grouped = {} as Record<string, number>;
      
      this.deposits
        .filter(deposit => deposit.status === 'active')
        .forEach(deposit => {
          if (!grouped[deposit.bank]) {
            grouped[deposit.bank] = 0;
          }
          grouped[deposit.bank] += deposit.amount;
        });
      
      const totalDeposits = this.totalDeposits;
      
      return Object.entries(grouped).map(([bank, amount]) => ({
        bank,
        amount,
        percentage: totalDeposits > 0 ? (amount / totalDeposits) * 100 : 0
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
    addTransaction(transaction: Omit<Transaction, 'id'>) {
      const id = Date.now().toString();
      this.transactions.push({ ...transaction, id });
      this.saveData();
    },
    updateTransaction(transaction: Transaction) {
      const index = this.transactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        this.transactions[index] = transaction;
        this.saveData();
      }
    },
    deleteTransaction(id: string) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      this.saveData();
    },
    addRecurringItem(item: Omit<RecurringItem, 'id'>) {
      const id = Date.now().toString();
      this.recurringItems.push({ ...item, id });
      this.saveData();
    },
    updateRecurringItem(item: RecurringItem) {
      const index = this.recurringItems.findIndex(i => i.id === item.id);
      if (index !== -1) {
        this.recurringItems[index] = item;
        this.saveData();
      }
    },
    deleteRecurringItem(id: string) {
      this.recurringItems = this.recurringItems.filter(i => i.id !== id);
      this.saveData();
    },
    addDebt(debt: Omit<Debt, 'id'>) {
      const id = Date.now().toString();
      this.debts.push({ ...debt, id });
      this.saveData();
    },
    updateDebt(debt: Debt) {
      const index = this.debts.findIndex(d => d.id === debt.id);
      if (index !== -1) {
        this.debts[index] = debt;
        this.saveData();
      }
    },
    deleteDebt(id: string) {
      this.debts = this.debts.filter(d => d.id !== id);
      this.saveData();
    },
    makeDebtPayment(id: string, amount: number) {
      const index = this.debts.findIndex(d => d.id === id);
      if (index !== -1) {
        const debt = this.debts[index];
        debt.currentAmount = Math.max(0, debt.currentAmount - amount);
        
        // Добавим транзакцию платежа по долгу
        this.addTransaction({
          date: moment().format('YYYY-MM-DD'),
          amount,
          category: 'Долги',
          description: `Платеж по долгу: ${debt.name}`,
          type: 'expense'
        });
        
        this.saveData();
      }
    },
    // Методы для работы с вкладами
    addDeposit(deposit: Omit<Deposit, 'id'>) {
      const id = Date.now().toString();
      this.deposits.push({ ...deposit, id });
      this.saveData();
    },
    updateDeposit(deposit: Deposit) {
      const index = this.deposits.findIndex(d => d.id === deposit.id);
      if (index !== -1) {
        this.deposits[index] = deposit;
        this.saveData();
      }
    },
    deleteDeposit(id: string) {
      this.deposits = this.deposits.filter(d => d.id !== id);
      this.saveData();
    },
    closeDeposit(id: string, closeAmount: number) {
      const index = this.deposits.findIndex(d => d.id === id);
      if (index !== -1) {
        const deposit = this.deposits[index];
        deposit.status = 'closed';
        
        // Добавим транзакцию закрытия вклада
        this.addTransaction({
          date: moment().format('YYYY-MM-DD'),
          amount: closeAmount,
          category: 'Инвестиции',
          description: `Закрытие вклада: ${deposit.name}`,
          type: 'income'
        });
        
        this.saveData();
      }
    },
    addInterestPayment(id: string, amount: number) {
      const index = this.deposits.findIndex(d => d.id === id);
      if (index !== -1) {
        const deposit = this.deposits[index];
        deposit.amount += amount;
        
        // Добавим транзакцию процентов по вкладу
        this.addTransaction({
          date: moment().format('YYYY-MM-DD'),
          amount,
          category: 'Проценты по вкладам',
          description: `Проценты по вкладу: ${deposit.name}`,
          type: 'income'
        });
        
        this.saveData();
      }
    },
    loadDemoData() {
      // Загрузка демонстрационных данных
      const today = moment().format('YYYY-MM-DD');
      const lastMonth = moment().subtract(1, 'month').format('YYYY-MM-DD');
      
      this.transactions = [
        { id: '1', date: today, amount: 100000, category: 'Зарплата', description: 'Зарплата за май', type: 'income' },
        { id: '2', date: today, amount: 20000, category: 'Фриланс', description: 'Проект для клиента', type: 'income' },
        { id: '3', date: today, amount: 15000, category: 'Жилье', description: 'Оплата аренды', type: 'expense' },
        { id: '4', date: today, amount: 5000, category: 'Питание', description: 'Продукты', type: 'expense' },
        { id: '5', date: lastMonth, amount: 100000, category: 'Зарплата', description: 'Зарплата за апрель', type: 'income' },
        { id: '6', date: lastMonth, amount: 10000, category: 'Развлечения', description: 'Кино и ресторан', type: 'expense' },
      ];
      
      this.recurringItems = [
        { id: '1', amount: 100000, description: 'Ежемесячная зарплата', category: 'Зарплата', type: 'income', frequency: 'monthly', startDate: today },
        { id: '2', amount: 15000, description: 'Оплата аренды', category: 'Жилье', type: 'expense', frequency: 'monthly', startDate: today },
        { id: '3', amount: 20000, description: 'Продукты', category: 'Питание', type: 'expense', frequency: 'monthly', startDate: today },
        { id: '4', amount: 5000, description: 'Подписки', category: 'Развлечения', type: 'expense', frequency: 'monthly', startDate: today },
      ];
      
      this.debts = [
        { 
          id: '1', 
          name: 'Кредит на автомобиль', 
          initialAmount: 500000, 
          currentAmount: 350000, 
          interestRate: 12, 
          minimumPayment: 15000, 
          dueDay: 15, 
          startDate: moment().subtract(6, 'months').format('YYYY-MM-DD') 
        },
        { 
          id: '2', 
          name: 'Кредитная карта', 
          initialAmount: 100000, 
          currentAmount: 80000, 
          interestRate: 18, 
          minimumPayment: 5000, 
          dueDay: 20, 
          startDate: moment().subtract(3, 'months').format('YYYY-MM-DD') 
        }
      ];
      
      // Демо-данные для вкладов
      this.deposits = [
        {
          id: '1',
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
          id: '2',
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
        }
      ];
      
      this.saveData();
    },
    saveData() {
      // Сохранение в localStorage
      if (process.client) {
        localStorage.setItem('finance-transactions', JSON.stringify(this.transactions));
        localStorage.setItem('finance-recurring', JSON.stringify(this.recurringItems));
        localStorage.setItem('finance-debts', JSON.stringify(this.debts));
        localStorage.setItem('finance-deposits', JSON.stringify(this.deposits));
      }
    },
    loadData() {
      // Загрузка из localStorage
      if (process.client) {
        const transactions = localStorage.getItem('finance-transactions');
        const recurring = localStorage.getItem('finance-recurring');
        const debts = localStorage.getItem('finance-debts');
        const deposits = localStorage.getItem('finance-deposits');
        
        if (transactions) this.transactions = JSON.parse(transactions);
        if (recurring) this.recurringItems = JSON.parse(recurring);
        if (debts) this.debts = JSON.parse(debts);
        if (deposits) this.deposits = JSON.parse(deposits);
      }
    }
  }
});
    monthlyIncome(): number {
      const currentMonth = moment().format('YYYY-MM');
      return this.transactions
        .filter(t => t.type === 'income' && moment(t.date).format('YYYY-MM') === currentMonth)
        .reduce((sum, t) => sum + t.amount, 0);
    },
    monthlyExpense(): number {
      const currentMonth = moment().format('YYYY-MM');
      return this.transactions
        .filter(t => t.type === 'expense' && moment(t.date).format('YYYY-MM') === currentMonth)
        .reduce((sum, t) => sum + t.amount, 0);
    },
    totalDebt(): number {
      return this.debts.reduce((sum, debt) => sum + debt.currentAmount, 0);
    },
    monthlyRecurringIncome(): number {
      return this.recurringItems
        .filter(item => item.type === 'income' && item.frequency === 'monthly')
        .reduce((sum, item) => sum + item.amount, 0);
    },
    monthlyRecurringExpense(): number {
      return this.recurringItems
        .filter(item => item.type === 'expense' && item.frequency === 'monthly')
        .reduce((sum, item) => sum + item.amount, 0);
    },
    monthlyNet(): number {
      return this.monthlyRecurringIncome - this.monthlyRecurringExpense;
    },
    breakEvenPoint(): string | null {
      if (this.totalDebt <= 0 || this.monthlyNet <= 0) {
        return null;
      }
      
      const monthsToBreakEven = Math.ceil(this.totalDebt / this.monthlyNet);
      return moment().add(monthsToBreakEven, 'months').format('MMMM YYYY');
    },
    transactionsByMonth() {
      const grouped = {} as Record<string, { income: number, expense: number }>;
      
      this.transactions.forEach(transaction => {
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
    },    expensesByCategory() {
      const currentMonth = moment().format('YYYY-MM');
      const grouped = {} as Record<string, number>;
      
      this.transactions
        .filter(t => t.type === 'expense' && moment(t.date).format('YYYY-MM') === currentMonth)
        .forEach(transaction => {
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
    totalDeposits(): number {
      return this.deposits
        .filter(deposit => deposit.status === 'active')
        .reduce((sum, deposit) => sum + deposit.amount, 0);
    },
    totalDepositInterest(): number {
      return this.deposits
        .filter(deposit => deposit.status === 'active')
        .reduce((sum, deposit) => {
          const initialAmount = deposit.initialAmount;
          const currentAmount = deposit.amount;
          return sum + (currentAmount - initialAmount);
        }, 0);
    },
    activeDeposits(): Deposit[] {
      return this.deposits.filter(deposit => deposit.status === 'active');
    },
    upcomingMaturityDeposits(): Deposit[] {
      const threeMonthsFromNow = moment().add(3, 'months').format('YYYY-MM-DD');
      return this.deposits
        .filter(deposit => deposit.status === 'active' && deposit.endDate <= threeMonthsFromNow)
        .sort((a, b) => a.endDate.localeCompare(b.endDate));
    },
    depositsByBank() {      const grouped = {} as Record<string, number>;
      
      this.deposits
        .filter(deposit => deposit.status === 'active')
        .forEach(deposit => {
          if (!grouped[deposit.bank]) {
            grouped[deposit.bank] = 0;
          }
          grouped[deposit.bank] += deposit.amount;
        });
      
      return Object.entries(grouped).map(([bank, amount]) => ({
        bank,
        amount,
        percentage: amount / (this.totalDeposits || 1) * 100
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
    addTransaction(transaction: Omit<Transaction, 'id'>) {
      const id = Date.now().toString();
      this.transactions.push({ ...transaction, id });
      this.saveData();
    },
    updateTransaction(transaction: Transaction) {
      const index = this.transactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        this.transactions[index] = transaction;
        this.saveData();
      }
    },
    deleteTransaction(id: string) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      this.saveData();
    },
    addRecurringItem(item: Omit<RecurringItem, 'id'>) {
      const id = Date.now().toString();
      this.recurringItems.push({ ...item, id });
      this.saveData();
    },
    updateRecurringItem(item: RecurringItem) {
      const index = this.recurringItems.findIndex(i => i.id === item.id);
      if (index !== -1) {
        this.recurringItems[index] = item;
        this.saveData();
      }
    },
    deleteRecurringItem(id: string) {
      this.recurringItems = this.recurringItems.filter(i => i.id !== id);
      this.saveData();
    },
    addDebt(debt: Omit<Debt, 'id'>) {
      const id = Date.now().toString();
      this.debts.push({ ...debt, id });
      this.saveData();
    },
    updateDebt(debt: Debt) {
      const index = this.debts.findIndex(d => d.id === debt.id);
      if (index !== -1) {
        this.debts[index] = debt;
        this.saveData();
      }
    },
    deleteDebt(id: string) {
      this.debts = this.debts.filter(d => d.id !== id);
      this.saveData();
    },
    makeDebtPayment(id: string, amount: number) {
      const index = this.debts.findIndex(d => d.id === id);
      if (index !== -1) {
        const debt = this.debts[index];
        debt.currentAmount = Math.max(0, debt.currentAmount - amount);
        
        // Добавим транзакцию платежа по долгу
        this.addTransaction({
          date: moment().format('YYYY-MM-DD'),
          amount,
          category: 'Долги',
          description: `Платеж по долгу: ${debt.name}`,
          type: 'expense'
        });
        
        this.saveData();
      }
    },    loadDemoData() {
      // Загрузка демонстрационных данных
      const today = moment().format('YYYY-MM-DD');
      const lastMonth = moment().subtract(1, 'month').format('YYYY-MM-DD');
      
      this.transactions = [
        { id: '1', date: today, amount: 100000, category: 'Зарплата', description: 'Зарплата за май', type: 'income' },
        { id: '2', date: today, amount: 20000, category: 'Фриланс', description: 'Проект для клиента', type: 'income' },
        { id: '3', date: today, amount: 15000, category: 'Жилье', description: 'Оплата аренды', type: 'expense' },
        { id: '4', date: today, amount: 5000, category: 'Питание', description: 'Продукты', type: 'expense' },
        { id: '5', date: lastMonth, amount: 100000, category: 'Зарплата', description: 'Зарплата за апрель', type: 'income' },
        { id: '6', date: lastMonth, amount: 10000, category: 'Развлечения', description: 'Кино и ресторан', type: 'expense' },
      ];
      
      this.recurringItems = [
        { id: '1', amount: 100000, description: 'Ежемесячная зарплата', category: 'Зарплата', type: 'income', frequency: 'monthly', startDate: today },
        { id: '2', amount: 15000, description: 'Оплата аренды', category: 'Жилье', type: 'expense', frequency: 'monthly', startDate: today },
        { id: '3', amount: 20000, description: 'Продукты', category: 'Питание', type: 'expense', frequency: 'monthly', startDate: today },
        { id: '4', amount: 5000, description: 'Подписки', category: 'Развлечения', type: 'expense', frequency: 'monthly', startDate: today },
      ];
      
      this.debts = [
        { 
          id: '1', 
          name: 'Кредит на автомобиль', 
          initialAmount: 500000, 
          currentAmount: 350000, 
          interestRate: 12, 
          minimumPayment: 15000, 
          dueDay: 15, 
          startDate: moment().subtract(6, 'months').format('YYYY-MM-DD') 
        },
        { 
          id: '2', 
          name: 'Кредитная карта', 
          initialAmount: 100000, 
          currentAmount: 80000, 
          interestRate: 18, 
          minimumPayment: 5000, 
          dueDay: 20, 
          startDate: moment().subtract(3, 'months').format('YYYY-MM-DD') 
        }
      ];
      
      // Демо-данные для вкладов
      this.deposits = [
        {
          id: '1',
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
          id: '2',
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
          id: '3',
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
        },
        {
          id: '4',
          name: 'Закрытый вклад',
          amount: 300000,
          initialAmount: 250000,
          interestRate: 7.0,
          startDate: moment().subtract(12, 'months').format('YYYY-MM-DD'),
          endDate: moment().subtract(1, 'months').format('YYYY-MM-DD'),
          bank: 'Альфа-Банк',
          isCapitalized: false,
          paymentFrequency: 'atMaturity',
          status: 'closed'
        }
      ];
      
      this.saveData();
    },saveData() {
      // Сохранение в localStorage
      if (process.client) {
        localStorage.setItem('finance-transactions', JSON.stringify(this.transactions));
        localStorage.setItem('finance-recurring', JSON.stringify(this.recurringItems));
        localStorage.setItem('finance-debts', JSON.stringify(this.debts));
        localStorage.setItem('finance-deposits', JSON.stringify(this.deposits));
      }
    },
    loadData() {
      // Загрузка из localStorage
      if (process.client) {
        const transactions = localStorage.getItem('finance-transactions');
        const recurring = localStorage.getItem('finance-recurring');
        const debts = localStorage.getItem('finance-debts');
        const deposits = localStorage.getItem('finance-deposits');
        
        if (transactions) this.transactions = JSON.parse(transactions);
        if (recurring) this.recurringItems = JSON.parse(recurring);
        if (debts) this.debts = JSON.parse(debts);
        if (deposits) this.deposits = JSON.parse(deposits);
      }
    }
  }
});
