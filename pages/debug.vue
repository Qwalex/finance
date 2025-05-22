<template>
  <div>
    <h1>Отладка месячного чистого дохода</h1>
    <div>
      <p>Ежемесячные доходы: {{ monthlyRecurringIncome }}</p>
      <p>Ежемесячные расходы: {{ monthlyRecurringExpense }}</p>
      <p>Чистый ежемесячный доход: {{ monthlyNet }}</p>
      <p>Чистый ежемесячный доход (вычисленный): {{ monthlyRecurringIncome - monthlyRecurringExpense }}</p>
      <p>Количество периодических расходов: {{ recurringExpenses.length }}</p>
      <p>Количество периодических доходов: {{ recurringIncomes.length }}</p>
      <hr>
      <h2>Периодические доходы:</h2>
      <div v-for="item in recurringIncomes" :key="item.id">
        {{ item.description }}: {{ item.amount }} ({{ item.frequency }})
      </div>
      <hr>
      <h2>Периодические расходы:</h2>
      <div v-for="item in recurringExpenses" :key="item.id">
        {{ item.description }}: {{ item.amount }} ({{ item.frequency }})
      </div>
      <hr>
      <button @click="resetRecurringItems">Сбросить периодические платежи</button>
      <button @click="checkMonthlyNet">Проверить чистый доход</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useFinanceStore } from '~/stores/finance';

const financeStore = useFinanceStore();

const monthlyRecurringIncome = computed(() => financeStore.monthlyRecurringIncome);
const monthlyRecurringExpense = computed(() => financeStore.monthlyRecurringExpense);
const monthlyNet = computed(() => financeStore.monthlyNet);

const recurringIncomes = computed(() => 
  financeStore.recurringItems.filter(item => item.type === 'income' && item.frequency === 'monthly')
);

const recurringExpenses = computed(() => 
  financeStore.recurringItems.filter(item => item.type === 'expense' && item.frequency === 'monthly')
);

const resetRecurringItems = () => {
  financeStore.recurringItems = [];
  console.log('Периодические платежи сброшены');
};

const checkMonthlyNet = () => {
  console.log('Доходы:', monthlyRecurringIncome.value);
  console.log('Расходы:', monthlyRecurringExpense.value);
  console.log('Чистый доход:', monthlyNet.value);
  console.log('Вычисленный чистый доход:', monthlyRecurringIncome.value - monthlyRecurringExpense.value);
};
</script>

<style scoped>
div {
  margin: 20px;
}
button {
  margin: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
</style>
