<template>
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-bold">{{ $t('incomingInvoice.itemList') }}</h1>
      <NuxtLink :to="localePath('/incoming-invoices/create')"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>

    <!-- Панель фильтров -->
    <div class="p-4 bg-white rounded-lg shadow mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Фильтр по дате -->
        <DateRangePicker v-model="localSearchQuery.dates" />

        <!-- Фильтр по складу -->
        <div>
          <label for="warehouse" class="block text-sm font-medium text-gray-700">{{ $t('warehouse.item') }}</label>
          <select id="warehouse" v-model="localSearchQuery.warehouse" class="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option :value="null">{{ $t('all') }}</option>
            <option v-for="warehouse in warehouseStore.warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </option>
          </select>
        </div>

        <!-- Фильтр по поставщику -->
        <div>
          <label for="supplier" class="block text-sm font-medium text-gray-700">{{ $t('supplier.item') }}</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <div class="relative flex items-stretch flex-grow focus-within:z-10">
              <input
                  type="text"
                  readonly
                  :value="selectedSupplierName"
                  :placeholder="$t('supplier.notSelected')"
                  class="p-2 block w-full rounded-none rounded-l-md border-gray-300 bg-gray-50"
              />
            </div>
            <button @click="localSearchQuery.supplier = null; selectedSupplierName = ''" v-if="localSearchQuery.supplier" type="button" class="-ml-px relative inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100">
              <X class="h-5 w-5 text-gray-400" />
            </button>
            <button @click="showContractorDialog = true" type="button" class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100">
              <Search class="h-5 w-5 text-gray-400" />
              <span>{{ $t('actions.select') }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Кнопки управления фильтром -->
      <div class="flex justify-end space-x-2 mt-4 pt-4 border-t">
        <button @click="handleReset" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
          {{ $t('search.reset') }}
        </button>
        <button @click="handleSearch" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          {{ $t('search.find') }}
        </button>
      </div>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center">
      <BaseSpinner />
      <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
    </div>

    <!-- Сообщение, если нет данных -->
    <div v-else-if="!store.invoices || store.invoices.length === 0" class="text-center text-gray-500 bg-white rounded-lg shadow p-8">
      {{ $t('messages.noData') }}
    </div>

    <!-- Таблица с данными -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
        <tr>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('date.item') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('supplier.item') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('warehouse.item') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('amount') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('paid_amount') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('status') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('actions.operations') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="invoice in store.invoices" :key="invoice.id" @click="viewInvoice(invoice.id)" class="cursor-pointer hover:bg-gray-100 transition-colors">
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ invoice.id }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ formatDate(invoice.date) }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ invoice.supplier.name }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ invoice.warehouse.name }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ invoice.amount }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ invoice.paid_amount }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">
              <span :class="invoice.accepted ? 'text-green-600' : 'text-red-600'">
                {{ invoice.accepted ? $t('status.accepted') : $t('status.notAccepted') }}
              </span>
          </td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">
            <div class="flex items-center space-x-4">
              <NuxtLink :to="localePath(`/incoming-invoices/${invoice.id}/edit`)" @click.stop class="text-indigo-600 hover:text-indigo-900">
                <Pencil class="w-5 h-5"/>
              </NuxtLink>
              <button @click.stop="confirmDelete(invoice.id)" class="text-red-600 hover:text-red-900">
                <Trash2 class="w-5 h-5"/>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Пагинация -->
      <BasePagination
          :total-records="store.totalRecords"
          :page-size="store.pageSize"
          :current-page="store.currentPage"
          :total-pages="store.totalPages"
          :is-loading="store.isLoading"
          @page-changed="goToPage"
      />
    </div>

    <!-- Диалоговое окно выбора контрагента -->
    <ContractorSelectDialog v-model="showContractorDialog" @select="handleContractorSelect" />

    <!-- Диалоговое окно подтверждения удаления -->
    <ConfirmDialog
        v-model="showDeleteModal"
        :title="$t('captions.confirmDelete')"
        :message="$t('incomingInvoice.confirmDelete')"
        :confirm-button-text="$t('actions.delete')"
        @confirm="deleteItemConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useIncomingInvoicesStore } from '~/stores/incomingInvoices';
import { useWarehouseStore } from '~/stores/warehouses';
import { type Contractor } from '~/stores/contractors';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Pencil, Trash2, Search, X } from 'lucide-vue-next';

// Импорт компонентов
import BaseSpinner from '~/components/BaseSpinner.vue';
import BasePagination from '~/components/BasePagination.vue';
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue';
import ContractorSelectDialog from '~/components/dialogs/ContractorSelectDialog.vue';
import DateRangePicker from '~/components/dialogs/DateRangePicker.vue';

// --- Инициализация ---
const store = useIncomingInvoicesStore();
const warehouseStore = useWarehouseStore();
const router = useRouter();
const localePath = useLocalePath();
const { t } = useI18n();

// --- Локальное состояние ---
const showContractorDialog = ref(false);
const showDeleteModal = ref(false);
const itemToDeleteId = ref<number | null>(null);
const selectedSupplierName = ref('');

// Локальная копия фильтров для удобства
const localSearchQuery = ref({
  dates: { from: store.searchQuery.date_from, to: store.searchQuery.date_to },
  warehouse: store.searchQuery.warehouse,
  supplier: store.searchQuery.supplier,
});

// --- Функции ---

function handleSearch() {
  // Обновляем состояние в хранилище из локальной копии
  store.searchQuery.date_from = localSearchQuery.value.dates.from;
  store.searchQuery.date_to = localSearchQuery.value.dates.to;
  store.searchQuery.warehouse = localSearchQuery.value.warehouse;
  store.searchQuery.supplier = localSearchQuery.value.supplier;

  store.fetchRecords(1); // Запускаем поиск с первой страницы
}

function handleReset() {
  // Сбрасываем локальные фильтры
  localSearchQuery.value = {
    dates: { from: null, to: null },
    warehouse: null,
    supplier: null,
  };
  selectedSupplierName.value = '';
  // Запускаем пустой поиск
  handleSearch();
}

function goToPage(page: number) {
  if (page >= 1 && page <= store.totalPages) {
    store.fetchRecords(page);
  }
}

function viewInvoice(id: number) {
  router.push(localePath(`/incoming-invoices/${id}`));
}

function confirmDelete(id: number) {
  itemToDeleteId.value = id;
  showDeleteModal.value = true;
}

async function deleteItemConfirmed() {
  if (itemToDeleteId.value) {
    await store.deleteRecord(itemToDeleteId.value);
    // fetchRecords уже вызывается внутри deleteRecord, поэтому список обновится
  }
}

function handleContractorSelect(contractor: Contractor) {
  localSearchQuery.value.supplier = contractor.id;
  selectedSupplierName.value = contractor.name;
  showContractorDialog.value = false;
}

function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// --- Жизненный цикл ---
onMounted(() => {
  // Загружаем данные при первой загрузке страницы
  store.fetchRecords(store.currentPage);
  // Загружаем склады для фильтра (если их еще нет)
  if (warehouseStore.warehouses.length === 0) {
    warehouseStore.fetchRecords(1); // Загружаем первую страницу складов
  }
});
</script>
