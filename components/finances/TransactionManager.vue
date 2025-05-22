<template>
  <div>
    <Toast />
    
    <div class="card">
      <div class="card-header">
        <div class="card-title">Транзакции</div>
        <Button label="Добавить транзакцию" icon="pi pi-plus" @click="openNewDialog" />
      </div>
        <DataTable :value="transactions" stripedRows :paginator="true" :rows="10"
                 :rowsPerPageOptions="[5, 10, 25, 50]" sortField="date" :sortOrder="-1"
                 paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                 currentPageReportTemplate="Показано {first} до {last} из {totalRecords} транзакций"
                 :filters="filters" filterDisplay="menu" class="p-datatable-sm"
                 :loading="loading" loadingIcon="pi pi-spinner">
        
        <Column field="date" header="Дата" sortable>
          <template #body="{ data }">
            {{ formatDate(data.date) }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Calendar v-model="filterModel.value" dateFormat="dd.mm.yy" 
                      placeholder="Фильтр по дате" @date-select="filterCallback()" />
          </template>
        </Column>
        
        <Column field="type" header="Тип" sortable>
          <template #body="{ data }">
            <span :class="data.type === 'income' ? 'positive' : 'negative'">
              {{ data.type === 'income' ? 'Доход' : 'Расход' }}
            </span>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown v-model="filterModel.value" :options="typeOptions" 
                      placeholder="Выберите тип" @change="filterCallback()" />
          </template>
        </Column>
        
        <Column field="category" header="Категория" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown v-model="filterModel.value" :options="categoryOptions" 
                      placeholder="Выберите категорию" @change="filterCallback()" />
          </template>
        </Column>
        
        <Column field="description" header="Описание" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Фильтр" />
          </template>
        </Column>
        
        <Column field="amount" header="Сумма" sortable>
          <template #body="{ data }">
            <span :class="data.type === 'income' ? 'positive' : 'negative'">
              {{ formatCurrency(data.amount) }}
            </span>
          </template>
        </Column>
        
        <Column header="Действия">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="editTransaction(data)" />
              <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    
    <!-- Диалог добавления/редактирования транзакции -->
    <Dialog v-model:visible="dialogVisible" :header="dialogMode === 'add' ? 'Новая транзакция' : 'Редактирование транзакции'" modal>
      <div class="form-row">
        <label for="transaction-type">Тип транзакции</label>
        <Dropdown id="transaction-type" v-model="editingTransaction.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Выберите тип" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="transaction-date">Дата</label>
        <Calendar id="transaction-date" v-model="editingTransaction.date" dateFormat="dd.mm.yy" placeholder="Выберите дату" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="transaction-amount">Сумма</label>
        <InputNumber id="transaction-amount" v-model="editingTransaction.amount" mode="currency" currency="RUB" locale="ru-RU" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="transaction-category">Категория</label>
        <Dropdown id="transaction-category" v-model="editingTransaction.category" 
                 :options="editingTransaction.type === 'income' ? categories.income : categories.expense" 
                 placeholder="Выберите категорию" class="w-full" />
      </div>
      
      <div class="form-row">
        <label for="transaction-description">Описание</label>
        <InputText id="transaction-description" v-model="editingTransaction.description" placeholder="Введите описание" class="w-full" />
      </div>
      
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
        <Button label="Сохранить" icon="pi pi-check" @click="saveTransaction" autofocus />
      </template>
    </Dialog>
    
    <!-- Диалог подтверждения удаления -->
    <Dialog v-model:visible="deleteDialogVisible" header="Подтверждение удаления" modal>
      <p>Вы уверены, что хотите удалить эту транзакцию?</p>
      <template #footer>
        <Button label="Нет" icon="pi pi-times" @click="deleteDialogVisible = false" class="p-button-text" />
        <Button label="Да" icon="pi pi-check" @click="deleteTransaction" class="p-button-danger" autofocus />
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

// Состояние загрузки
const loading = computed(() => financeStore.isLoading.transactions);

// Загрузка данных
onMounted(async () => {
  await financeStore.fetchTransactions();
});

// Фильтры для таблицы
const filters = ref({
  date: { value: null, matchMode: 'dateIs' },
  type: { value: null, matchMode: 'equals' },
  category: { value: null, matchMode: 'equals' },
  description: { value: null, matchMode: 'contains' }
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
const transactions = computed(() => financeStore.transactions);
const categories = computed(() => financeStore.categories);
const typeOptions = [
  { label: 'Доход', value: 'income' },
  { label: 'Расход', value: 'expense' }
];
const categoryOptions = computed(() => {
  return [
    ...financeStore.categories.income,
    ...financeStore.categories.expense
  ];
});

// Диалог редактирования/добавления
const dialogVisible = ref(false);
const dialogMode = ref('add');
const defaultTransaction = {
  type: 'expense',
  date: new Date(),
  amount: 0,
  category: '',
  description: ''
};
const editingTransaction = reactive({...defaultTransaction});
const editingId = ref(null);

// Диалог удаления
const deleteDialogVisible = ref(false);
const deletingId = ref(null);

// Методы
const openNewDialog = () => {
  dialogMode.value = 'add';
  Object.assign(editingTransaction, defaultTransaction);
  editingTransaction.date = new Date();
  dialogVisible.value = true;
};

const editTransaction = (transaction) => {
  dialogMode.value = 'edit';
  editingId.value = transaction.id;
  Object.assign(editingTransaction, {
    type: transaction.type,
    date: new Date(transaction.date),
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description
  });
  dialogVisible.value = true;
};

const saveTransaction = async () => {
  if (!editingTransaction.category || !editingTransaction.amount) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Пожалуйста, заполните все обязательные поля',
      life: 3000
    });
    return;
  }
  
  const transactionData = {
    type: editingTransaction.type,
    date: moment(editingTransaction.date).format('YYYY-MM-DD'),
    amount: editingTransaction.amount,
    category: editingTransaction.category,
    description: editingTransaction.description
  };
  
  try {
    let result;
    
    if (dialogMode.value === 'add') {
      result = await financeStore.addTransaction(transactionData);
      if (result.success) {
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Транзакция добавлена',
          life: 3000
        });
      } else {
        throw new Error(result.error || 'Ошибка при добавлении транзакции');
      }
    } else {
      result = await financeStore.updateTransaction({
        id: editingId.value,
        ...transactionData
      });
      if (result.success) {
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Транзакция обновлена',
          life: 3000
        });
      } else {
        throw new Error(result.error || 'Ошибка при обновлении транзакции');
      }
    }
    
    closeDialog();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.message,
      life: 3000
    });
  }
};

const closeDialog = () => {
  dialogVisible.value = false;
  editingId.value = null;
};

const confirmDelete = (transaction) => {
  deletingId.value = transaction.id;
  deleteDialogVisible.value = true;
};

const deleteTransaction = async () => {
  try {
    const result = await financeStore.deleteTransaction(deletingId.value);
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Транзакция удалена',
        life: 3000
      });
    } else {
      throw new Error(result.error || 'Ошибка при удалении транзакции');
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.message,
      life: 3000
    });
  } finally {
    deleteDialogVisible.value = false;
    deletingId.value = null;
  }
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

.w-full {
  width: 100%;
}
</style>
