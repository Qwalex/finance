<template>
  <div>
    <Toast />
    
    <div class="card">
      <div class="card-header">
        <div class="card-title">Задолженности</div>
        <Button label="Добавить долг" icon="pi pi-plus" @click="openNewDialog" />
      </div>
      
      <div v-if="debts.length > 0" class="debt-summary">
        <div class="debt-total">
          <div class="summary-label">Общая задолженность:</div>
          <div class="summary-value negative">{{ formatCurrency(totalDebt) }}</div>
        </div>
        
        <div v-if="breakEvenPoint" class="debt-break-even">
          <div class="summary-label">Точка безубыточности:</div>
          <div class="summary-value">{{ breakEvenPoint }}</div>
        </div>
      </div>
      
      <div v-if="debts.length === 0" class="empty-state">
        <p>У вас пока нет задолженностей. Если они есть, добавьте их для учета.</p>
      </div>
      
      <div v-else class="debt-cards">
        <div v-for="debt in debts" :key="debt.id" class="debt-card">
          <div class="debt-card-header">
            <h3>{{ debt.name }}</h3>
            <div class="debt-actions">
              <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editDebt(debt)" />
              <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="confirmDelete(debt)" />
            </div>
          </div>
          
          <div class="debt-details">
            <div class="debt-detail">
              <span class="debt-label">Сумма:</span>
              <span class="debt-value negative">{{ formatCurrency(debt.currentAmount) }}</span>
            </div>
            
            <div class="debt-detail">
              <span class="debt-label">Процентная ставка:</span>
              <span class="debt-value">{{ debt.interestRate }}%</span>
            </div>
            
            <div class="debt-detail">
              <span class="debt-label">Минимальный платеж:</span>
              <span class="debt-value">{{ formatCurrency(debt.minimumPayment) }}</span>
            </div>
            
            <div class="debt-detail">
              <span class="debt-label">День платежа:</span>
              <span class="debt-value">{{ debt.dueDay }} число</span>
            </div>
            
            <div class="debt-detail">
              <span class="debt-label">Дата начала:</span>
              <span class="debt-value">{{ formatDate(debt.startDate) }}</span>
            </div>
            
            <div class="debt-progress">
              <div class="progress-label">
                <span>Погашено:</span>
                <span>{{ calculatePayoffPercentage(debt) }}%</span>
              </div>
              <ProgressBar :value="calculatePayoffPercentage(debt)" />
            </div>
            
            <div class="debt-actions-bottom">
              <Button label="Внести платеж" @click="openPaymentDialog(debt)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Диалог добавления/редактирования долга -->
    <Dialog v-model:visible="dialogVisible" :header="dialogMode === 'add' ? 'Новый долг' : 'Редактирование долга'" modal>
      <div class="form-row">
        <label for="debt-name">Название</label>
        <InputText id="debt-name" v-model="editingDebt.name" placeholder="Название долга" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="debt-initial-amount">Начальная сумма</label>
        <InputNumber id="debt-initial-amount" v-model="editingDebt.initialAmount" mode="currency" currency="RUB" locale="ru-RU" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="debt-current-amount">Текущая сумма</label>
        <InputNumber id="debt-current-amount" v-model="editingDebt.currentAmount" mode="currency" currency="RUB" locale="ru-RU" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="debt-interest-rate">Процентная ставка (%)</label>
        <InputNumber id="debt-interest-rate" v-model="editingDebt.interestRate" mode="decimal" minFractionDigits="1" maxFractionDigits="2" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="debt-minimum-payment">Минимальный платеж</label>
        <InputNumber id="debt-minimum-payment" v-model="editingDebt.minimumPayment" mode="currency" currency="RUB" locale="ru-RU" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="debt-due-day">День платежа</label>
        <InputNumber id="debt-due-day" v-model="editingDebt.dueDay" mode="decimal" :min="1" :max="31" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="debt-start-date">Дата начала</label>
        <Calendar id="debt-start-date" v-model="editingDebt.startDate" dateFormat="dd.mm.yy" placeholder="Дата начала" class="w-full" />
      </div>
      
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
        <Button label="Сохранить" icon="pi pi-check" @click="saveDebt" autofocus />
      </template>
    </Dialog>
    
    <!-- Диалог внесения платежа -->
    <Dialog v-model:visible="paymentDialogVisible" header="Внести платеж" modal>
      <div v-if="selectedDebt" class="payment-dialog-content">
        <div class="payment-debt-info">
          <h3>{{ selectedDebt.name }}</h3>
          <div class="payment-debt-amount">
            Текущая задолженность: <span class="negative">{{ formatCurrency(selectedDebt.currentAmount) }}</span>
          </div>
          <div class="payment-minimum">
            Минимальный платеж: {{ formatCurrency(selectedDebt.minimumPayment) }}
          </div>
        </div>
        
        <div class="form-row">
          <label for="payment-amount">Сумма платежа</label>
          <InputNumber id="payment-amount" v-model="paymentAmount" mode="currency" currency="RUB" locale="ru-RU" class="w-full" />
        </div>
        
        <div class="payment-suggestions">
          <Button label="Мин. платеж" class="p-button-sm" @click="paymentAmount = selectedDebt.minimumPayment" />
          <Button label="Вся сумма" class="p-button-sm" @click="paymentAmount = selectedDebt.currentAmount" />
        </div>
      </div>
      
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" @click="closePaymentDialog" class="p-button-text" />
        <Button label="Внести платеж" icon="pi pi-check" @click="makePayment" :disabled="!paymentAmount" autofocus />
      </template>
    </Dialog>
    
    <!-- Диалог подтверждения удаления -->
    <Dialog v-model:visible="deleteDialogVisible" header="Подтверждение удаления" modal>
      <p>Вы уверены, что хотите удалить этот долг?</p>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" @click="deleteDialogVisible = false" class="p-button-text" />
        <Button label="Да" icon="pi pi-check" @click="deleteDebt" class="p-button-danger" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useFinanceStore } from '~/stores/finance';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const financeStore = useFinanceStore();
const toast = useToast();

// Загрузка данных
onMounted(() => {
  financeStore.loadData();
});

// Форматирование
const formatDate = (date) => {
  return moment(date).format('DD.MM.YYYY');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);
};

// Данные
const debts = computed(() => financeStore.debts);
const totalDebt = computed(() => financeStore.totalDebt);
const breakEvenPoint = computed(() => financeStore.breakEvenPoint);

// Расчет процента погашения
const calculatePayoffPercentage = (debt) => {
  if (debt.initialAmount <= 0) return 0;
  const paid = Math.max(0, debt.initialAmount - debt.currentAmount);
  return Math.round((paid / debt.initialAmount) * 100);
};

// Диалог редактирования/добавления
const dialogVisible = ref(false);
const dialogMode = ref('add');
const defaultDebt = {
  name: '',
  initialAmount: 0,
  currentAmount: 0,
  interestRate: 0,
  minimumPayment: 0,
  dueDay: 1,
  startDate: new Date()
};
const editingDebt = reactive({...defaultDebt});
const editingId = ref(null);

// Диалог платежа
const paymentDialogVisible = ref(false);
const selectedDebt = ref(null);
const paymentAmount = ref(0);

// Диалог удаления
const deleteDialogVisible = ref(false);
const deletingId = ref(null);

// Методы
const openNewDialog = () => {
  dialogMode.value = 'add';
  Object.assign(editingDebt, defaultDebt);
  editingDebt.startDate = new Date();
  dialogVisible.value = true;
};

const editDebt = (debt) => {
  dialogMode.value = 'edit';
  editingId.value = debt.id;
  Object.assign(editingDebt, {
    name: debt.name,
    initialAmount: debt.initialAmount,
    currentAmount: debt.currentAmount,
    interestRate: debt.interestRate,
    minimumPayment: debt.minimumPayment,
    dueDay: debt.dueDay,
    startDate: new Date(debt.startDate)
  });
  dialogVisible.value = true;
};

const saveDebt = () => {
  if (!editingDebt.name || !editingDebt.initialAmount) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Пожалуйста, заполните все обязательные поля',
      life: 3000
    });
    return;
  }
  
  const debtData = {
    name: editingDebt.name,
    initialAmount: editingDebt.initialAmount,
    currentAmount: editingDebt.currentAmount,
    interestRate: editingDebt.interestRate,
    minimumPayment: editingDebt.minimumPayment,
    dueDay: editingDebt.dueDay,
    startDate: moment(editingDebt.startDate).format('YYYY-MM-DD')
  };
  
  if (dialogMode.value === 'add') {
    financeStore.addDebt(debtData);
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Долг добавлен',
      life: 3000
    });
  } else {
    financeStore.updateDebt({
      id: editingId.value,
      ...debtData
    });
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Долг обновлен',
      life: 3000
    });
  }
  
  closeDialog();
};

const closeDialog = () => {
  dialogVisible.value = false;
  editingId.value = null;
};

// Методы для платежей
const openPaymentDialog = (debt) => {
  selectedDebt.value = debt;
  paymentAmount.value = debt.minimumPayment;
  paymentDialogVisible.value = true;
};

const closePaymentDialog = () => {
  paymentDialogVisible.value = false;
  selectedDebt.value = null;
  paymentAmount.value = 0;
};

const makePayment = () => {
  if (!selectedDebt.value || !paymentAmount.value) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Пожалуйста, укажите сумму платежа',
      life: 3000
    });
    return;
  }
  
  financeStore.makeDebtPayment(selectedDebt.value.id, paymentAmount.value);
  
  toast.add({
    severity: 'success',
    summary: 'Успешно',
    detail: 'Платеж внесен',
    life: 3000
  });
  
  closePaymentDialog();
};

// Методы для удаления
const confirmDelete = (debt) => {
  deletingId.value = debt.id;
  deleteDialogVisible.value = true;
};

const deleteDebt = () => {
  financeStore.deleteDebt(deletingId.value);
  toast.add({
    severity: 'success',
    summary: 'Успешно',
    detail: 'Долг удален',
    life: 3000
  });
  deleteDialogVisible.value = false;
  deletingId.value = null;
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.debt-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.debt-total, .debt-break-even {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-label {
  font-weight: 600;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.debt-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.debt-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.debt-card-header {
  background-color: #f1f1f1;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debt-card-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.debt-details {
  padding: 15px;
}

.debt-detail {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}

.debt-label {
  color: #666;
}

.debt-progress {
  margin: 15px 0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.debt-actions-bottom {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.form-row {
  margin-bottom: 15px;
}

.form-row label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.w-full {
  width: 100%;
}

.payment-dialog-content {
  width: 300px;
}

.payment-debt-info {
  margin-bottom: 20px;
}

.payment-debt-amount {
  margin: 10px 0;
  font-weight: 500;
}

.payment-minimum {
  color: #666;
  margin-bottom: 10px;
}

.payment-suggestions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style>
