<template>
  <div class="dashboard-stats">
    <div class="card stat-card">
      <div class="stat-value" :class="totalBalance >= 0 ? 'positive' : 'negative'">
        {{ formatCurrency(totalBalance) }}
      </div>
      <div class="stat-label">Общий баланс</div>
    </div>
    
    <div class="card stat-card">
      <div class="stat-value positive">{{ formatCurrency(monthlyIncome) }}</div>
      <div class="stat-label">Доходы за месяц</div>
    </div>
    
    <div class="card stat-card">
      <div class="stat-value negative">{{ formatCurrency(monthlyExpense) }}</div>
      <div class="stat-label">Расходы за месяц</div>
    </div>
    
    <div class="card stat-card">
      <div class="stat-value" :class="monthlyNet >= 0 ? 'positive' : 'negative'">
        {{ formatCurrency(monthlyNet) }}
      </div>
      <div class="stat-label">Чистый месячный доход</div>
    </div>
  </div>
  
  <!-- Информация о вкладах -->
  <div class="card" v-if="totalDeposits > 0">
    <div class="card-title">Вклады и депозиты</div>
    <div class="deposits-info">
      <div class="deposits-grid">
        <div class="deposit-stat">
          <div class="deposit-amount positive">{{ formatCurrency(totalDeposits) }}</div>
          <div class="deposit-label">Сумма вкладов</div>
        </div>
        <div class="deposit-stat">
          <div class="deposit-amount positive">{{ formatCurrency(totalDepositInterest) }}</div>
          <div class="deposit-label">Полученные проценты</div>
        </div>
      </div>
      <div v-if="upcomingMaturityDeposits.length > 0" class="upcoming-deposits">
        <h4>Скоро заканчиваются:</h4>
        <ul class="upcoming-list">
          <li v-for="deposit in upcomingMaturityDeposits" :key="deposit.id">
            {{ deposit.name }} - {{ formatCurrency(deposit.amount) }} 
            (до {{ formatDate(deposit.endDate) }})
          </li>
        </ul>
      </div>
    </div>
  </div>
  
  <div class="card" v-if="totalDebt > 0">
    <div class="card-title">Ваш долг</div>
    <div class="debt-info">
      <div class="debt-amount negative">{{ formatCurrency(totalDebt) }}</div>
      <div v-if="breakEvenPoint" class="break-even">
        Точка безубыточности: <strong>{{ breakEvenPoint }}</strong>
      </div>
      <div v-else class="break-even warning">
        С текущими доходами и расходами вы не сможете погасить долг.
      </div>
    </div>
  </div>
  
  <div class="card">
    <div class="card-title">Доходы и расходы по месяцам</div>
    <div class="chart-container">
      <Chart type="bar" :data="monthlyChartData" :options="chartOptions" />
    </div>
  </div>
  
  <div class="card">
    <div class="card-title">Структура расходов за месяц</div>
    <div class="chart-container">
      <Chart type="pie" :data="categoryChartData" :options="pieChartOptions" />
    </div>
  </div>
  
  <!-- Графики активов -->
  <div class="card" v-if="totalDeposits > 0 || totalBalance > 0">
    <div class="card-title">Структура активов</div>
    <div class="chart-container">
      <Chart type="pie" :data="assetsChartData" :options="pieChartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useFinanceStore } from '~/stores/finance';
import moment from 'moment';

const financeStore = useFinanceStore();

onMounted(() => {
  if (financeStore.transactions.length === 0) {
    financeStore.loadData();
    
    // Если данных нет, загрузим демонстрационные данные
    // if (financeStore.transactions.length === 0) {
    //   financeStore.loadDemoData();
    // }
  }
});

const totalBalance = computed(() => financeStore.totalBalance);
const monthlyIncome = computed(() => financeStore.monthlyIncome);
const monthlyExpense = computed(() => financeStore.monthlyExpense);
const monthlyNet = computed(() => financeStore.monthlyNet);
const totalDebt = computed(() => financeStore.totalDebt);
const breakEvenPoint = computed(() => financeStore.breakEvenPoint);
const totalDeposits = computed(() => financeStore.totalDeposits);
const totalDepositInterest = computed(() => financeStore.totalDepositInterest);
const upcomingMaturityDeposits = computed(() => financeStore.upcomingMaturityDeposits);
const totalAssets = computed(() => financeStore.totalAssets);
const netWorth = computed(() => financeStore.netWorth);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString) => {
  return moment(dateString).format('DD.MM.YYYY');
};

// Данные для гистограммы по месяцам
const monthlyChartData = computed(() => {
  const monthlyData = financeStore.transactionsByMonth;
  const lastSixMonths = monthlyData.slice(-6);
  
  return {
    labels: lastSixMonths.map(item => moment(item.month).format('MMM YYYY')),
    datasets: [
      {
        label: 'Доходы',
        backgroundColor: '#4caf50',
        data: lastSixMonths.map(item => item.income)
      },
      {
        label: 'Расходы',
        backgroundColor: '#f44336',
        data: lastSixMonths.map(item => item.expense)
      },
      {
        label: 'Чистый доход',
        backgroundColor: '#2196f3',
        data: lastSixMonths.map(item => item.net)
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
        callback: (value) => {
          return formatCurrency(value);
        }
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
const categoryChartData = computed(() => {
  const categoryData = financeStore.expensesByCategory;
  
  return {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        data: categoryData.map(item => item.amount),
        backgroundColor: [
          '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC',
          '#EC407A', '#7E57C2', '#26A69A', '#D4E157', '#78909C'
        ]
      }
    ]
  };
});

// Данные для круговой диаграммы активов
const assetsChartData = computed(() => {
  const assets = [];
  
  if (totalBalance.value > 0) {
    assets.push({
      label: 'Наличные и счета',
      value: totalBalance.value
    });
  }
  
  if (totalDeposits.value > 0) {
    assets.push({
      label: 'Вклады',
      value: totalDeposits.value
    });
  }
  
  return {
    labels: assets.map(item => item.label),
    datasets: [
      {
        data: assets.map(item => item.value),
        backgroundColor: ['#2196f3', '#4caf50']
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
          const percentage = (context.raw / context.dataset.data.reduce((a, b) => a + b, 0) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
});
</script>

<style scoped>
.deposits-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0;
}

.deposits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.deposit-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.deposit-amount {
  font-size: 1.5rem;
  font-weight: bold;
}

.deposit-label {
  font-size: 0.9rem;
  color: #666;
}

.upcoming-deposits h4 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.upcoming-list {
  list-style-type: none;
  padding: 0;
}

.upcoming-list li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.debt-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.debt-amount {
  font-size: 2rem;
  font-weight: bold;
}

.break-even {
  font-size: 1.1rem;
}

.warning {
  color: #f57c00;
}

.positive {
  color: #4caf50;
}

.negative {
  color: #f44336;
}
</style>
