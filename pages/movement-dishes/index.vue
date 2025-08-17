<template>
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-bold">{{ $t('movementDish.itemList') }}</h1>
      <NuxtLink :to="localePath('/movement-dishes/create')"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>

    <!-- Панель фильтров -->
    <div class="p-4 bg-white rounded-lg shadow mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Фильтр по дате -->
        <DateRangePicker v-model="localSearchQuery.dates" />

        <!-- Фильтр Со склада -->
        <div>
          <label for="warehouse_from" class="block text-sm font-medium text-gray-700">{{ $t('movementDish.warehouse_from') }}</label>
          <select id="warehouse_from" v-model="localSearchQuery.warehouse_from" class="mt-1 block w-full h-10 px-2 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm">
            <option :value="null">{{ $t('all') }}</option>
            <option v-for="warehouse in warehouseStore.warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </option>
          </select>
        </div>

        <!-- Фильтр На склад -->
        <div>
          <label for="warehouse_to" class="block text-sm font-medium text-gray-700">{{ $t('movementDish.warehouse_to') }}</label>
          <select id="warehouse_to" v-model="localSearchQuery.warehouse_to" class="mt-1 block w-full h-10 px-2 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm">
            <option :value="null">{{ $t('all') }}</option>
            <option v-for="warehouse in warehouseStore.warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </option>
          </select>
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

    <!-- ИЗМЕНЕНИЕ: Проверяем store.list вместо store.invoices -->
    <div v-else-if="!store.list || store.list.length === 0" class="text-center text-gray-500 bg-white rounded-lg shadow p-8">
      {{ $t('messages.noData') }}
    </div>

    <!-- Таблица с данными -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
        <tr>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('date.item') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('movementDish.warehouse_from') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('movementDish.warehouse_to') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('docs.status') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('actions.operations') }}</th>
        </tr>
        </thead>
        <tbody>
        <!-- ИЗМЕНЕНИЕ: Итерируем по store.list вместо store.invoices -->
        <tr v-for="writingOff in store.list" :key="writingOff.id" @click="viewMovementDish(writingOff.id)" class="cursor-pointer hover:bg-gray-100 transition-colors">
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ writingOff.id }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ formatDate(writingOff.date) }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ writingOff.warehouse_from.name }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ writingOff.warehouse_to.name }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">
            <SquareCheckBig v-if="writingOff.accepted" class="w-5 h-5 text-green-600" />
            <CircleOff v-else class="w-5 h-5 text-red-600" />
          </td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">
            <div class="flex items-center space-x-4">
              <NuxtLink :to="localePath(`/movement-dishes/${writingOff.id}/edit`)" @click.stop class="text-indigo-600 hover:text-indigo-900">
                <Pencil class="w-5 h-5"/>
              </NuxtLink>
              <button @click.stop="confirmDelete(writingOff.id)" class="text-red-600 hover:text-red-900">
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

    <!-- Диалоговое окно подтверждения удаления -->
    <ConfirmDialog
        v-model="showDeleteModal"
        :title="$t('captions.confirmDelete')"
        :message="$t('docs.confirmDelete')"
        :confirm-button-text="$t('actions.delete')"
        @confirm="deleteItemConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMovementDishesStore } from '~/stores/movementDishes';
import { useWarehouseStore } from '~/stores/warehouses';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Pencil, Trash2, SquareCheckBig, CircleOff} from 'lucide-vue-next';

// Импорт компонентов
import BaseSpinner from '~/components/BaseSpinner.vue';
import BasePagination from '~/components/BasePagination.vue';
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue';
import DateRangePicker from '~/components/dialogs/DateRangePicker.vue';

// --- Инициализация ---
const store = useMovementDishesStore();
const warehouseStore = useWarehouseStore();
const router = useRouter();
const localePath = useLocalePath();
const { t, locale } = useI18n();

// --- Локальное состояние ---
const showDeleteModal = ref(false);
const itemToDeleteId = ref<number | null>(null);

// Локальная копия фильтров для удобства
const localSearchQuery = ref({
  dates: { from: store.searchQuery.date_from, to: store.searchQuery.date_to },
  warehouse_from: store.searchQuery.warehouse_from,
  warehouse_to: store.searchQuery.warehouse_to,
});

// --- Функции ---

function handleSearch() {
  // Обновляем состояние в хранилище из локальной копии
  store.searchQuery.date_from = localSearchQuery.value.dates.from;
  store.searchQuery.date_to = localSearchQuery.value.dates.to;
  store.searchQuery.warehouse_from = localSearchQuery.value.warehouse_from;
  store.searchQuery.warehouse_to = localSearchQuery.value.warehouse_to;

  store.fetchRecords(1); // Запускаем поиск с первой страницы
}

function handleReset() {
  // Сбрасываем локальные фильтры
  localSearchQuery.value = {
    dates: { from: null, to: null },
    warehouse_from: null,
    warehouse_to: null,
  };
  // Запускаем пустой поиск
  handleSearch();
}

function goToPage(page: number) {
  if (page >= 1 && page <= store.totalPages) {
    store.fetchRecords(page);
  }
}

function viewMovementDish(id: number) {
  router.push(localePath(`/movement-dishes/${id}`));
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
    warehouseStore.fetchRecords(1);
  }
});
</script>
