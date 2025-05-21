<template>
  <div>
    <Toast />
    
    <div class="card">
      <div class="card-header">
        <div class="card-title">Регулярные платежи</div>
        <Button label="Добавить платеж" icon="pi pi-plus" @click="openNewDialog" />
      </div>
      
      <TabView>
        <TabPanel header="Доходы">
          <DataTable :value="recurringIncome" stripedRows class="p-datatable-sm">
            <Column field="description" header="Описание" sortable></Column>
            <Column field="category" header="Категория" sortable></Column>
            <Column field="frequency" header="Частота" sortable>
              <template #body="{ data }">
                {{ formatFrequency(data.frequency) }}
              </template>
            </Column>
            <Column field="amount" header="Сумма" sortable>
              <template #body="{ data }">
                <span class="positive">{{ formatCurrency(data.amount) }}</span>
              </template>
            </Column>
            <Column field="startDate" header="Начало" sortable>
              <template #body="{ data }">
                {{ formatDate(data.startDate) }}
              </template>
            </Column>
            <Column field="endDate" header="Окончание" sortable>
              <template #body="{ data }">
                {{ data.endDate ? formatDate(data.endDate) : 'Бессрочно' }}
              </template>
            </Column>
            <Column header="Действия">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editItem(data)" />
                  <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="confirmDelete(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        
        <TabPanel header="Расходы">
          <DataTable :value="recurringExpense" stripedRows class="p-datatable-sm">
            <Column field="description" header="Описание" sortable></Column>
            <Column field="category" header="Категория" sortable></Column>
            <Column field="frequency" header="Частота" sortable>
              <template #body="{ data }">
                {{ formatFrequency(data.frequency) }}
              </template>
            </Column>
            <Column field="amount" header="Сумма" sortable>
              <template #body="{ data }">
                <span class="negative">{{ formatCurrency(data.amount) }}</span>
              </template>
            </Column>
            <Column field="startDate" header="Начало" sortable>
              <template #body="{ data }">
                {{ formatDate(data.startDate) }}
              </template>
            </Column>
            <Column field="endDate" header="Окончание" sortable>
              <template #body="{ data }">
                {{ data.endDate ? formatDate(data.endDate) : 'Бессрочно' }}
              </template>
            </Column>
            <Column header="Действия">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editItem(data)" />
                  <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="confirmDelete(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
      
      <div class="summary-section">
        <div class="summary-item">
          <div class="summary-label">Ежемесячные доходы:</div>
          <div class="summary-value positive">{{ formatCurrency(monthlyRecurringIncome) }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Ежемесячные расходы:</div>
          <div class="summary-value negative">{{ formatCurrency(monthlyRecurringExpense) }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Чистый ежемесячный доход:</div>
          <div class="summary-value" :class="monthlyNet >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(monthlyNet) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Диалог добавления/редактирования -->
    <Dialog v-model:visible="dialogVisible" :header="dialogMode === 'add' ? 'Новый регулярный платеж' : 'Редактирование платежа'" modal>
      <div class="form-row">
        <label for="item-type">Тип</label>
        <Dropdown id="item-type" v-model="editingItem.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Выберите тип" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="item-description">Описание</label>
        <InputText id="item-description" v-model="editingItem.description" placeholder="Введите описание" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="item-amount">Сумма</label>
        <InputNumber id="item-amount" v-model="editingItem.amount" mode="currency" currency="RUB" locale="ru-RU" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="item-category">Категория</label>
        <Dropdown id="item-category" v-model="editingItem.category" 
                 :options="editingItem.type === 'income' ? categories.income : categories.expense" 
                 placeholder="Выберите категорию" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="item-frequency">Частота</label>
        <Dropdown id="item-frequency" v-model="editingItem.frequency" :options="frequencyOptions" 
                  optionLabel="label" optionValue="value" placeholder="Выберите частоту" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="item-start-date">Дата начала</label>
        <Calendar id="item-start-date" v-model="editingItem.startDate" dateFormat="dd.mm.yy" placeholder="Дата начала" class="w-full" />
      </div>
      
      <div class="form-row">
        <div class="has-end-date">
          <label>
            <input type="checkbox" v-model="hasEndDate" />
            Указать дату окончания
          </label>
        </div>
        
        <div v-if="hasEndDate" class="end-date-field">
          <label for="item-end-date">Дата окончания</label>
          <Calendar id="item-end-date" v-model="editingItem.endDate" dateFormat="dd.mm.yy" placeholder="Дата окончания" class="w-full" />
        </div>
      </div>
      
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
        <Button label="Сохранить" icon="pi pi-check" @click="saveItem" autofocus />
      </template>
    </Dialog>
    
    <!-- Диалог подтверждения удаления -->
    <Dialog v-model:visible="deleteDialogVisible" header="Подтверждение удаления" modal>
      <p>Вы уверены, что хотите удалить этот регулярный платеж?</p>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" @click="deleteDialogVisible = false" class="p-button-text" />
        <Button label="Да" icon="pi pi-check" @click="deleteItem" class="p-button-danger" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
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

const formatFrequency = (frequency) => {
  const options = {
    daily: 'Ежедневно',
    weekly: 'Еженедельно',
    monthly: 'Ежемесячно',
    yearly: 'Ежегодно'
  };
  return options[frequency] || frequency;
};

// Данные
const recurringIncome = computed(() => 
  financeStore.recurringItems.filter(item => item.type === 'income')
);

const recurringExpense = computed(() => 
  financeStore.recurringItems.filter(item => item.type === 'expense')
);

const monthlyRecurringIncome = computed(() => financeStore.monthlyRecurringIncome);
const monthlyRecurringExpense = computed(() => financeStore.monthlyRecurringExpense);
const monthlyNet = computed(() => financeStore.monthlyNet);

const categories = computed(() => financeStore.categories);

const typeOptions = [
  { label: 'Доход', value: 'income' },
  { label: 'Расход', value: 'expense' }
];

const frequencyOptions = [
  { label: 'Ежедневно', value: 'daily' },
  { label: 'Еженедельно', value: 'weekly' },
  { label: 'Ежемесячно', value: 'monthly' },
  { label: 'Ежегодно', value: 'yearly' }
];

// Редактирование/добавление
const dialogVisible = ref(false);
const dialogMode = ref('add');
const defaultItem = {
  type: 'expense',
  description: '',
  amount: 0,
  category: '',
  frequency: 'monthly',
  startDate: new Date(),
  endDate: null
};
const editingItem = reactive({...defaultItem});
const editingId = ref(null);
const hasEndDate = ref(false);

// Следим за изменением hasEndDate
watch(hasEndDate, (newValue) => {
  if (!newValue) {
    editingItem.endDate = null;
  }
});

// Диалог удаления
const deleteDialogVisible = ref(false);
const deletingId = ref(null);

// Методы
const openNewDialog = () => {
  dialogMode.value = 'add';
  Object.assign(editingItem, defaultItem);
  editingItem.startDate = new Date();
  hasEndDate.value = false;
  dialogVisible.value = true;
};

const editItem = (item) => {
  dialogMode.value = 'edit';
  editingId.value = item.id;
  Object.assign(editingItem, {
    type: item.type,
    description: item.description,
    amount: item.amount,
    category: item.category,
    frequency: item.frequency,
    startDate: new Date(item.startDate),
    endDate: item.endDate ? new Date(item.endDate) : null
  });
  hasEndDate.value = !!item.endDate;
  dialogVisible.value = true;
};

const saveItem = () => {
  if (!editingItem.description || !editingItem.amount || !editingItem.category) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Пожалуйста, заполните все обязательные поля',
      life: 3000
    });
    return;
  }
  
  const itemData = {
    type: editingItem.type,
    description: editingItem.description,
    amount: editingItem.amount,
    category: editingItem.category,
    frequency: editingItem.frequency,
    startDate: moment(editingItem.startDate).format('YYYY-MM-DD'),
    endDate: hasEndDate.value && editingItem.endDate ? moment(editingItem.endDate).format('YYYY-MM-DD') : undefined
  };
  
  if (dialogMode.value === 'add') {
    financeStore.addRecurringItem(itemData);
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Регулярный платеж добавлен',
      life: 3000
    });
  } else {
    financeStore.updateRecurringItem({
      id: editingId.value,
      ...itemData
    });
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Регулярный платеж обновлен',
      life: 3000
    });
  }
  
  closeDialog();
};

const closeDialog = () => {
  dialogVisible.value = false;
  editingId.value = null;
};

const confirmDelete = (item) => {
  deletingId.value = item.id;
  deleteDialogVisible.value = true;
};

const deleteItem = () => {
  financeStore.deleteRecurringItem(deletingId.value);
  toast.add({
    severity: 'success',
    summary: 'Успешно',
    detail: 'Регулярный платеж удален',
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

.action-buttons {
  display: flex;
  gap: 5px;
}

.form-row {
  margin-bottom: 15px;
}

.form-row label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.has-end-date {
  margin-bottom: 10px;
}

.end-date-field {
  margin-top: 5px;
}

.w-full {
  width: 100%;
}

.summary-section {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-around;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-label {
  font-weight: 600;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
