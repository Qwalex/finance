<template>
  <div>
    <h1 class="page-title">Отчеты</h1>
    
    <div class="card">
      <div class="card-title">Финансовый анализ</div>
      
      <TabView>
        <TabPanel header="Доходы и расходы">
          <div class="chart-container">
            <Chart type="bar" :data="incomeExpenseData" :options="chartOptions" />
          </div>
          
          <div class="summary-table">
            <h3>Сводка по месяцам</h3>
            <DataTable :value="monthlyData" stripedRows class="p-datatable-sm">
              <Column field="month" header="Месяц" sortable>
                <template #body="{ data }">
                  {{ formatMonthYear(data.month) }}
                </template>
              </Column>
              <Column field="income" header="Доходы" sortable>
                <template #body="{ data }">
                  <span class="positive">{{ formatCurrency(data.income) }}</span>
                </template>
              </Column>
              <Column field="expense" header="Расходы" sortable>
                <template #body="{ data }">
                  <span class="negative">{{ formatCurrency(data.expense) }}</span>
                </template>
              </Column>
              <Column field="net" header="Баланс" sortable>
                <template #body="{ data }">
                  <span :class="data.net >= 0 ? 'positive' : 'negative'">
                    {{ formatCurrency(data.net) }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>
        
        <TabPanel header="Структура расходов">
          <div class="chart-container">
            <Chart type="pie" :data="expenseByCategoryData" :options="pieChartOptions" />
          </div>
          
          <div class="summary-table">
            <h3>Расходы по категориям</h3>
            <DataTable :value="expenseCategories" stripedRows class="p-datatable-sm">
              <Column field="category" header="Категория" sortable></Column>
              <Column field="amount" header="Сумма" sortable>
                <template #body="{ data }">
                  <span class="negative">{{ formatCurrency(data.amount) }}</span>
                </template>
              </Column>
              <Column field="percentage" header="Процент" sortable>
                <template #body="{ data }">
                  {{ data.percentage.toFixed(1) }}%
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>
        
        <!-- Новая вкладка для анализа вкладов -->
        <TabPanel header="Вклады и активы" v-if="hasDeposits">
          <div class="deposits-overview">
            <div class="insights-grid">
              <div class="insight-card">
                <div class="insight-title">Общая сумма вкладов</div>
                <div class="insight-value positive">{{ formatCurrency(totalDeposits) }}</div>
              </div>
              
              <div class="insight-card">
                <div class="insight-title">Полученные проценты</div>
                <div class="insight-value positive">{{ formatCurrency(totalDepositInterest) }}</div>
              </div>
              
              <div class="insight-card">
                <div class="insight-title">Средний % ставка</div>
                <div class="insight-value">{{ averageInterestRate.toFixed(2) }}%</div>
              </div>
              
              <div class="insight-card">
                <div class="insight-title">Ожидаемый годовой доход</div>
                <div class="insight-value positive">{{ formatCurrency(yearlyInterestIncome) }}</div>
              </div>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>Распределение вкладов по банкам</h3>
            <Chart type="pie" :data="depositsByBankData" :options="pieChartOptions" />
          </div>
          
          <div class="chart-container">
            <h3>Вклады и рост процентов</h3>
            <Chart type="bar" :data="depositsComparisonData" :options="chartOptions" />
          </div>
          
          <div class="assets-overview" v-if="netWorth !== 0">
            <h3>Структура чистых активов</h3>
            <div class="chart-container">
              <Chart type="pie" :data="netWorthData" :options="pieChartOptions" />
            </div>
            
            <div class="insights-grid">
              <div class="insight-card">
                <div class="insight-title">Наличные и счета</div>
                <div class="insight-value" :class="totalBalance >= 0 ? 'positive' : 'negative'">
                  {{ formatCurrency(totalBalance) }}
                </div>
              </div>
              
              <div class="insight-card">
                <div class="insight-title">Вклады</div>
                <div class="insight-value positive">{{ formatCurrency(totalDeposits) }}</div>
              </div>
              
              <div class="insight-card">
                <div class="insight-title">Долги</div>
                <div class="insight-value negative">{{ formatCurrency(totalDebt) }}</div>
              </div>
              
              <div class="insight-card">
                <div class="insight-title">Чистая стоимость</div>
                <div class="insight-value" :class="netWorth >= 0 ? 'positive' : 'negative'">
                  {{ formatCurrency(netWorth) }}
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        
        <TabPanel header="Тренды">
          <div class="chart-container">
            <Chart type="line" :data="trendsData" :options="lineChartOptions" />
          </div>
          
          <div class="insights">
            <h3>Финансовые инсайты</h3>
            <div class="insights-grid">
              <div class="insight-card" v-if="averageMonthlyExpense > 0">
                <div class="insight-title">Средний месячный расход</div>
                <div class="insight-value negative">{{ formatCurrency(averageMonthlyExpense) }}</div>
              </div>
              
              <div class="insight-card" v-if="averageMonthlyIncome > 0">
                <div class="insight-title">Средний месячный доход</div>
                <div class="insight-value positive">{{ formatCurrency(averageMonthlyIncome) }}</div>
              </div>
              
              <div class="insight-card" v-if="savingsRate !== null">
                <div class="insight-title">Норма сбережений</div>
                <div class="insight-value" :class="savingsRate >= 0 ? 'positive' : 'negative'">
                  {{ savingsRate.toFixed(1) }}%
                </div>
              </div>
              
              <div class="insight-card" v-if="monthlyGrowthRate !== null">
                <div class="insight-title">Динамика баланса</div>
                <div class="insight-value" :class="monthlyGrowthRate >= 0 ? 'positive' : 'negative'">
                  {{ monthlyGrowthRate > 0 ? '+' : '' }}{{ monthlyGrowthRate.toFixed(1) }}%
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        
        <TabPanel header="Прогнозы">
          <div class="chart-container">
            <Chart type="line" :data="forecastData" :options="forecastOptions" />
          </div>
          
          <div class="forecast-insights">
            <h3>Финансовые прогнозы</h3>
            <div class="insights-grid">
              <div class="insight-card">
                <div class="insight-title">Прогноз баланса через 3 месяца</div>
                <div class="insight-value" :class="threeMontForecast >= 0 ? 'positive' : 'negative'">
                  {{ formatCurrency(threeMontForecast) }}
                </div>
              </div>
              
              <div class="insight-card">
                <div class="insight-title">Прогноз баланса через 6 месяцев</div>
                <div class="insight-value" :class="sixMonthForecast >= 0 ? 'positive' : 'negative'">
                  {{ formatCurrency(sixMonthForecast) }}
                </div>
              </div>
              
              <div class="insight-card" v-if="breakEvenMonths !== null">
                <div class="insight-title">Время до точки безубыточности</div>
                <div class="insight-value">
                  {{ breakEvenMonths }} {{ pluralizeMonth(breakEvenMonths) }}
                </div>
              </div>
              
              <div class="insight-card" v-if="breakEvenPoint">
                <div class="insight-title">Дата выхода на ноль</div>
                <div class="insight-value">{{ breakEvenPoint }}</div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useFinanceStore } from '~/stores/finance';
import moment from 'moment';

const financeStore = useFinanceStore();

// Форматирование
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);
};

const formatMonthYear = (dateString) => {
  return moment(dateString).format('MMMM YYYY');
};

const pluralizeMonth = (count) => {
  if (count === 1) return 'месяц';
  if (count >= 2 && count <= 4) return 'месяца';
  return 'месяцев';
};

// Данные для графика доходов и расходов
const monthlyData = computed(() => {
  return financeStore.transactionsByMonth.slice(-12); // последние 12 месяцев
});

const incomeExpenseData = computed(() => {
  return {
    labels: monthlyData.value.map(item => moment(item.month).format('MMM YYYY')),
    datasets: [
      {
        label: 'Доходы',
        backgroundColor: '#4caf50',
        data: monthlyData.value.map(item => item.income)
      },
      {
        label: 'Расходы',
        backgroundColor: '#f44336',
        data: monthlyData.value.map(item => item.expense)
      },
      {
        label: 'Баланс',
        backgroundColor: '#2196f3',
        data: monthlyData.value.map(item => item.net)
      }
    ]
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => formatCurrency(value)
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
        }
      }
    }
  }
});

// Данные для круговой диаграммы категорий расходов
const expenseCategories = computed(() => {
  const categories = financeStore.expensesByCategory;
  const totalExpense = categories.reduce((sum, cat) => sum + cat.amount, 0);
  
  return categories.map(cat => ({
    category: cat.category,
    amount: cat.amount,
    percentage: (cat.amount / totalExpense) * 100
  })).sort((a, b) => b.amount - a.amount);
});

const expenseByCategoryData = computed(() => {
  return {
    labels: expenseCategories.value.map(item => item.category),
    datasets: [
      {
        data: expenseCategories.value.map(item => item.amount),
        backgroundColor: [
          '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC',
          '#EC407A', '#7E57C2', '#26A69A', '#D4E157', '#78909C'
        ]
      }
    ]
  };
});

const pieChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = formatCurrency(context.raw);
          const totalValue = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = (context.raw / totalValue * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
});

// Данные о вкладах
const hasDeposits = computed(() => financeStore.deposits.length > 0);
const totalDeposits = computed(() => financeStore.totalDeposits);
const totalDepositInterest = computed(() => financeStore.totalDepositInterest);
const activeDeposits = computed(() => financeStore.activeDeposits);
const totalBalance = computed(() => financeStore.totalBalance);
const totalDebt = computed(() => financeStore.totalDebt);
const netWorth = computed(() => financeStore.netWorth);

const averageInterestRate = computed(() => {
  if (activeDeposits.value.length === 0) return 0;
  return activeDeposits.value.reduce((sum, deposit) => sum + deposit.interestRate, 0) / activeDeposits.value.length;
});

const yearlyInterestIncome = computed(() => {
  return activeDeposits.value.reduce((sum, deposit) => {
    // Годовой доход по вкладу
    return sum + (deposit.amount * (deposit.interestRate / 100));
  }, 0);
});

// Данные для графика вкладов по банкам
const depositsByBankData = computed(() => {
  const grouped = {};
  
  activeDeposits.value.forEach(deposit => {
    if (!grouped[deposit.bank]) {
      grouped[deposit.bank] = 0;
    }
    grouped[deposit.bank] += deposit.amount;
  });
  
  return {
    labels: Object.keys(grouped),
    datasets: [
      {
        data: Object.values(grouped),
        backgroundColor: [
          '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC',
          '#EC407A', '#7E57C2', '#26A69A', '#D4E157', '#78909C'
        ]
      }
    ]
  };
});

// Данные для сравнения вкладов
const depositsComparisonData = computed(() => {
  return {
    labels: activeDeposits.value.map(deposit => deposit.name),
    datasets: [
      {
        label: 'Начальная сумма',
        backgroundColor: '#42A5F5',
        data: activeDeposits.value.map(deposit => deposit.initialAmount)
      },
      {
        label: 'Текущая сумма',
        backgroundColor: '#66BB6A',
        data: activeDeposits.value.map(deposit => deposit.amount)
      },
      {
        label: 'Проценты',
        backgroundColor: '#FFA726',
        data: activeDeposits.value.map(deposit => deposit.amount - deposit.initialAmount)
      }
    ]
  };
});

// Данные для структуры активов
const netWorthData = computed(() => {
  const assets = [];
  const liabilities = [];
  
  if (totalBalance.value > 0) {
    assets.push({
      label: 'Наличные и счета',
      value: totalBalance.value
    });
  } else if (totalBalance.value < 0) {
    liabilities.push({
      label: 'Отрицательный баланс',
      value: Math.abs(totalBalance.value)
    });
  }
  
  if (totalDeposits.value > 0) {
    assets.push({
      label: 'Вклады',
      value: totalDeposits.value
    });
  }
  
  if (totalDebt.value > 0) {
    liabilities.push({
      label: 'Долги',
      value: totalDebt.value
    });
  }
  
  const datasets = [];
  
  if (assets.length > 0) {
    datasets.push({
      label: 'Активы',
      data: assets.map(a => a.value),
      backgroundColor: ['#4caf50', '#2196f3']
    });
  }
  
  if (liabilities.length > 0) {
    datasets.push({
      label: 'Обязательства',
      data: liabilities.map(l => l.value),
      backgroundColor: ['#f44336', '#ff9800']
    });
  }
  
  return {
    labels: [...assets.map(a => a.label), ...liabilities.map(l => l.label)],
    datasets: [
      {
        data: [...assets.map(a => a.value), ...liabilities.map(l => l.value)],
        backgroundColor: [
          '#4caf50', // наличные
          '#2196f3', // вклады
          '#f44336', // отрицательный баланс
          '#ff9800'  // долги
        ]
      }
    ]
  };
});

// Данные для трендов
const trendsData = computed(() => {
  return {
    labels: monthlyData.value.map(item => moment(item.month).format('MMM YYYY')),
    datasets: [
      {
        label: 'Баланс',
        borderColor: '#2196f3',
        fill: false,
        tension: 0.4,
        data: monthlyData.value.map(item => item.net)
      }
    ]
  };
});

const lineChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: {
        callback: (value) => formatCurrency(value)
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
        }
      }
    }
  }
});

// Аналитика и инсайты
const averageMonthlyExpense = computed(() => {
  if (monthlyData.value.length === 0) return 0;
  const total = monthlyData.value.reduce((sum, month) => sum + month.expense, 0);
  return total / monthlyData.value.length;
});

const averageMonthlyIncome = computed(() => {
  if (monthlyData.value.length === 0) return 0;
  const total = monthlyData.value.reduce((sum, month) => sum + month.income, 0);
  return total / monthlyData.value.length;
});

const savingsRate = computed(() => {
  if (averageMonthlyIncome.value === 0) return null;
  return ((averageMonthlyIncome.value - averageMonthlyExpense.value) / averageMonthlyIncome.value) * 100;
});

const monthlyGrowthRate = computed(() => {
  if (monthlyData.value.length < 2) return null;
  
  // Вычисляем средний процент роста/падения за последние месяцы
  let totalGrowth = 0;
  let countMonths = 0;
  
  for (let i = 1; i < monthlyData.value.length; i++) {
    const prevNet = monthlyData.value[i-1].net;
    const currentNet = monthlyData.value[i].net;
    
    if (prevNet !== 0) {
      totalGrowth += ((currentNet - prevNet) / Math.abs(prevNet)) * 100;
      countMonths++;
    }
  }
  
  return countMonths > 0 ? totalGrowth / countMonths : 0;
});

// Данные для прогнозов
const monthlyNet = computed(() => financeStore.monthlyNet);
const breakEvenPoint = computed(() => financeStore.breakEvenPoint);

// Прогнозируем будущий баланс на основе текущего баланса и месячного чистого дохода
const forecastMonths = 12; // прогноз на 12 месяцев вперед
const forecastData = computed(() => {
  const labels = [];
  const balanceData = [];
  
  let currentBalance = totalBalance.value;
  
  for (let i = 0; i < forecastMonths; i++) {
    const futureDate = moment().add(i, 'months');
    labels.push(futureDate.format('MMM YYYY'));
    
    currentBalance += monthlyNet.value;
    balanceData.push(currentBalance);
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Прогноз баланса',
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.3,
        data: balanceData
      }
    ]
  };
});

const forecastOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: {
        callback: (value) => formatCurrency(value)
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          return `Прогноз баланса: ${formatCurrency(context.raw)}`;
        }
      }
    }
  }
});

// Прогнозы на конкретные периоды
const threeMontForecast = computed(() => {
  return totalBalance.value + (monthlyNet.value * 3);
});

const sixMonthForecast = computed(() => {
  return totalBalance.value + (monthlyNet.value * 6);
});

const breakEvenMonths = computed(() => {
  if (totalDebt.value <= 0 || monthlyNet.value <= 0) return null;
  return Math.ceil(totalDebt.value / monthlyNet.value);
});
</script>

<style scoped>
.page-title {
  margin-bottom: 25px;
  font-size: 1.8rem;
  color: #2c3e50;
}

.chart-container {
  height: 350px;
  margin-bottom: 30px;
}

.chart-container h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.summary-table {
  margin-top: 20px;
}

.summary-table h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.insights, .forecast-insights, .deposits-overview, .assets-overview {
  margin-top: 20px;
}

.insights h3, .forecast-insights h3, .deposits-overview h3, .assets-overview h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.insight-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.insight-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.insight-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.positive {
  color: #4caf50;
}

.negative {
  color: #f44336;
}
</style>
