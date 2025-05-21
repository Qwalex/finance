<template>
  <div>
    <div class="card">
      <div class="card-title">Управление вкладами</div>
      
      <TabView>
        <TabPanel header="Активные вклады">
          <div class="mb-3">
            <Button label="Добавить вклад" icon="pi pi-plus" @click="openNewDepositDialog" />
          </div>
          
          <DataTable :value="activeDeposits" stripedRows>
            <Column field="name" header="Название" sortable></Column>
            <Column field="bank" header="Банк" sortable></Column>
            <Column field="amount" header="Текущая сумма" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.amount) }}
              </template>
            </Column>
            <Column field="interestRate" header="Ставка" sortable>
              <template #body="{ data }">
                {{ data.interestRate }}%
              </template>
            </Column>
            <Column field="startDate" header="Дата открытия" sortable>
              <template #body="{ data }">
                {{ formatDate(data.startDate) }}
              </template>
            </Column>
            <Column field="endDate" header="Дата окончания" sortable>
              <template #body="{ data }">
                {{ formatDate(data.endDate) }}
              </template>
            </Column>
            <Column field="paymentFrequency" header="Выплата %" sortable>
              <template #body="{ data }">
                {{ formatPaymentFrequency(data.paymentFrequency) }}
              </template>
            </Column>
            <Column field="interest" header="Полученные %" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.amount - data.initialAmount) }}
              </template>
            </Column>
            <Column header="Действия">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button icon="pi pi-pencil" text severity="secondary" @click="editDeposit(data)" />
                  <Button icon="pi pi-plus-circle" text severity="success" @click="openInterestDialog(data)" />
                  <Button icon="pi pi-check-circle" text severity="warning" @click="openCloseDepositDialog(data)" />
                  <Button icon="pi pi-trash" text severity="danger" @click="confirmDeleteDeposit(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        
        <TabPanel header="Закрытые вклады">
          <DataTable :value="closedDeposits" stripedRows>
            <Column field="name" header="Название" sortable></Column>
            <Column field="bank" header="Банк" sortable></Column>
            <Column field="amount" header="Итоговая сумма" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.amount) }}
              </template>
            </Column>
            <Column field="interestRate" header="Ставка" sortable>
              <template #body="{ data }">
                {{ data.interestRate }}%
              </template>
            </Column>
            <Column field="startDate" header="Дата открытия" sortable>
              <template #body="{ data }">
                {{ formatDate(data.startDate) }}
              </template>
            </Column>
            <Column field="endDate" header="Дата окончания" sortable>
              <template #body="{ data }">
                {{ formatDate(data.endDate) }}
              </template>
            </Column>
            <Column field="interest" header="Итого %" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.amount - data.initialAmount) }}
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        
        <TabPanel header="Аналитика">
          <div class="deposits-stats">
            <div class="stat-card">
              <div class="stat-value">{{ formatCurrency(totalDeposits) }}</div>
              <div class="stat-label">Общая сумма вкладов</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{ formatCurrency(totalInterest) }}</div>
              <div class="stat-label">Полученные проценты</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{ averageInterestRate.toFixed(2) }}%</div>
              <div class="stat-label">Средняя ставка</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{ formatCurrency(monthlyInterestIncome) }}</div>
              <div class="stat-label">Ежемесячный доход</div>
            </div>
          </div>
          
          <div class="chart-container" v-if="activeDeposits.length > 0">
            <Chart type="pie" :data="depositsByBankData" :options="chartOptions" />
          </div>
          
          <div class="chart-container" v-if="activeDeposits.length > 0">
            <Chart type="bar" :data="depositsComparison" :options="barChartOptions" />
          </div>
          
          <div class="upcoming-maturities" v-if="upcomingMaturities.length > 0">
            <h3>Скоро заканчиваются</h3>
            <DataTable :value="upcomingMaturities" stripedRows class="p-datatable-sm">
              <Column field="name" header="Название" sortable></Column>
              <Column field="amount" header="Сумма" sortable>
                <template #body="{ data }">
                  {{ formatCurrency(data.amount) }}
                </template>
              </Column>
              <Column field="endDate" header="Дата окончания" sortable>
                <template #body="{ data }">
                  {{ formatDate(data.endDate) }}
                </template>
              </Column>
              <Column field="daysLeft" header="Дней осталось" sortable>
                <template #body="{ data }">
                  {{ getDaysLeft(data.endDate) }}
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </div>
    
    <!-- Диалог добавления/редактирования вклада -->
    <Dialog v-model:visible="depositDialogVisible" :header="isEditMode ? 'Редактировать вклад' : 'Добавить вклад'" modal style="width: 450px">
      <div class="form-row">
        <label for="name">Название вклада</label>
        <InputText id="name" v-model="deposit.name" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="bank">Банк</label>
        <InputText id="bank" v-model="deposit.bank" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="initialAmount">Начальная сумма</label>
        <InputNumber id="initialAmount" v-model="deposit.initialAmount" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="interestRate">Процентная ставка (%)</label>
        <InputNumber id="interestRate" v-model="deposit.interestRate" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="startDate">Дата открытия</label>
        <Calendar id="startDate" v-model="deposit.startDate" dateFormat="dd.mm.yy" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="endDate">Дата окончания</label>
        <Calendar id="endDate" v-model="deposit.endDate" dateFormat="dd.mm.yy" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="paymentFrequency">Частота выплаты процентов</label>
        <Dropdown id="paymentFrequency" v-model="deposit.paymentFrequency" :options="paymentFrequencyOptions" optionLabel="label" optionValue="value" class="w-full" />
      </div>
      
      <div class="form-row">
        <div class="field-checkbox">
          <Checkbox id="isCapitalized" v-model="deposit.isCapitalized" :binary="true" />
          <label for="isCapitalized">Капитализация процентов</label>
        </div>
      </div>
      
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="depositDialogVisible = false" />
        <Button label="Сохранить" icon="pi pi-check" @click="saveDeposit" />
      </template>
    </Dialog>
    
    <!-- Диалог начисления процентов -->
    <Dialog v-model:visible="interestDialogVisible" header="Начисление процентов" modal style="width: 400px">
      <div class="form-row">
        <label for="interestAmount">Сумма начисления</label>
        <InputNumber id="interestAmount" v-model="interestAmount" class="w-full" />
      </div>
      
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="interestDialogVisible = false" />
        <Button label="Начислить" icon="pi pi-check" @click="addInterest" />
      </template>
    </Dialog>
    
    <!-- Диалог закрытия вклада -->
    <Dialog v-model:visible="closeDepositDialogVisible" header="Закрыть вклад" modal style="width: 400px">
      <div class="form-row">
        <label for="closeAmount">Сумма закрытия</label>
        <InputNumber id="closeAmount" v-model="closeAmount" class="w-full" />
      </div>
      
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" text @click="closeDepositDialogVisible = false" />
        <Button label="Закрыть вклад" icon="pi pi-check" severity="warning" @click="closeDeposit" />
      </template>
    </Dialog>
    
    <!-- Диалог подтверждения удаления -->
    <Dialog v-model:visible="deleteDialogVisible" header="Подтверждение" modal style="width: 400px">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Вы уверены, что хотите удалить этот вклад?</span>
      </div>
      
      <template #footer>
        <Button label="Нет" icon="pi pi-times" text @click="deleteDialogVisible = false" />
        <Button label="Да" icon="pi pi-check" severity="danger" @click="deleteDeposit" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFinanceStore } from '~/stores/finance';
import moment from 'moment';

const financeStore = useFinanceStore();

// Форматирование данных
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

const formatPaymentFrequency = (frequency) => {
  switch (frequency) {
    case 'monthly': return 'Ежемесячно';
    case 'quarterly': return 'Ежеквартально';
    case 'yearly': return 'Ежегодно';
    case 'atMaturity': return 'В конце срока';
    default: return frequency;
  }
};

const getDaysLeft = (endDate) => {
  const end = moment(endDate);
  const today = moment();
  return end.diff(today, 'days');
};

// Данные о вкладах
const activeDeposits = computed(() => {
  return financeStore.deposits.filter(deposit => deposit.status === 'active');
});

const closedDeposits = computed(() => {
  return financeStore.deposits.filter(deposit => deposit.status === 'closed');
});

const totalDeposits = computed(() => {
  return activeDeposits.value.reduce((sum, deposit) => sum + deposit.amount, 0);
});

const totalInterest = computed(() => {
  return activeDeposits.value.reduce((sum, deposit) => {
    return sum + (deposit.amount - deposit.initialAmount);
  }, 0);
});

const averageInterestRate = computed(() => {
  if (activeDeposits.value.length === 0) return 0;
  const sum = activeDeposits.value.reduce((total, deposit) => total + deposit.interestRate, 0);
  return sum / activeDeposits.value.length;
});

const monthlyInterestIncome = computed(() => {
  return activeDeposits.value.reduce((sum, deposit) => {
    // Упрощенный расчет ежемесячного дохода
    const monthlyRate = deposit.interestRate / 100 / 12;
    return sum + (deposit.amount * monthlyRate);
  }, 0);
});

const upcomingMaturities = computed(() => {
  const threeMonthsFromNow = moment().add(3, 'months').format('YYYY-MM-DD');
  return activeDeposits.value
    .filter(deposit => deposit.endDate <= threeMonthsFromNow)
    .sort((a, b) => a.endDate.localeCompare(b.endDate));
});

// Данные для графиков
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

const depositsComparison = computed(() => {
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

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = formatCurrency(context.raw);
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = (context.raw / total * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
});

const barChartOptions = ref({
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

// Опции для выпадающего списка
const paymentFrequencyOptions = [
  { label: 'Ежемесячно', value: 'monthly' },
  { label: 'Ежеквартально', value: 'quarterly' },
  { label: 'Ежегодно', value: 'yearly' },
  { label: 'В конце срока', value: 'atMaturity' }
];

// Управление диалогами
const depositDialogVisible = ref(false);
const interestDialogVisible = ref(false);
const closeDepositDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const isEditMode = ref(false);

// Модели данных
const deposit = ref({
  name: '',
  bank: '',
  initialAmount: 0,
  amount: 0,
  interestRate: 0,
  startDate: null,
  endDate: null,
  isCapitalized: false,
  paymentFrequency: 'monthly',
  status: 'active'
});

const selectedDeposit = ref(null);
const interestAmount = ref(0);
const closeAmount = ref(0);

// Методы диалогов
const openNewDepositDialog = () => {
  isEditMode.value = false;
  deposit.value = {
    name: '',
    bank: '',
    initialAmount: 0,
    amount: 0,
    interestRate: 0,
    startDate: new Date(),
    endDate: moment().add(1, 'year').toDate(),
    isCapitalized: false,
    paymentFrequency: 'monthly',
    status: 'active'
  };
  depositDialogVisible.value = true;
};

const editDeposit = (data) => {
  isEditMode.value = true;
  selectedDeposit.value = data;
  
  deposit.value = { 
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate)
  };
  
  depositDialogVisible.value = true;
};

const saveDeposit = () => {
  // Подготавливаем данные
  const depositData = {
    ...deposit.value,
    startDate: moment(deposit.value.startDate).format('YYYY-MM-DD'),
    endDate: moment(deposit.value.endDate).format('YYYY-MM-DD')
  };
  
  // Если создаем новый вклад, то начальная сумма = текущая сумма
  if (!isEditMode.value) {
    depositData.amount = depositData.initialAmount;
    financeStore.addDeposit(depositData);
  } else {
    financeStore.updateDeposit({
      ...depositData,
      id: selectedDeposit.value.id
    });
  }
  
  depositDialogVisible.value = false;
};

const openInterestDialog = (data) => {
  selectedDeposit.value = data;
  
  // Расчет примерной суммы начисления
  const monthlyRate = data.interestRate / 100 / 12;
  interestAmount.value = Math.round(data.amount * monthlyRate);
  
  interestDialogVisible.value = true;
};

const addInterest = () => {
  if (selectedDeposit.value && interestAmount.value > 0) {
    financeStore.addInterestPayment(selectedDeposit.value.id, interestAmount.value);
    interestDialogVisible.value = false;
  }
};

const openCloseDepositDialog = (data) => {
  selectedDeposit.value = data;
  closeAmount.value = data.amount;
  closeDepositDialogVisible.value = true;
};

const closeDeposit = () => {
  if (selectedDeposit.value && closeAmount.value > 0) {
    financeStore.closeDeposit(selectedDeposit.value.id, closeAmount.value);
    closeDepositDialogVisible.value = false;
  }
};

const confirmDeleteDeposit = (data) => {
  selectedDeposit.value = data;
  deleteDialogVisible.value = true;
};

const deleteDeposit = () => {
  if (selectedDeposit.value) {
    financeStore.deleteDeposit(selectedDeposit.value.id);
    deleteDialogVisible.value = false;
  }
};

// Инициализация
onMounted(() => {
  moment.locale('ru');
});
</script>

<style scoped>
.deposits-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.form-row {
  margin-bottom: 1rem;
}

.form-row label {
  display: block;
  margin-bottom: 0.5rem;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.chart-container {
  height: 350px;
  margin-bottom: 30px;
}

.upcoming-maturities {
  margin-top: 20px;
}

.upcoming-maturities h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}
</style>
