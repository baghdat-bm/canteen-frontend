<template>
  <div class="container mx-auto p-1">
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-bold">{{ $t('dishCategory.itemList') }}</h1>
      <NuxtLink :to="localePath('/dishes-categories/create')" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>

    <!-- Форма поиска -->
    <div class="p-2 bg-white rounded-lg shadow mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
            type="text"
            v-if="locale === 'kz'"
            v-model="localSearchQuery.name_kz"
            :placeholder="$t('search.byName')"
            class="p-2 border rounded-md"
            @keyup.enter="handleSearch"
        />
        <input
            type="text"
            v-if="locale === 'ru'"
            v-model="localSearchQuery.name_ru"
            :placeholder="$t('search.byName')"
            class="p-2 border rounded-md"
            @keyup.enter="handleSearch"
        />
        <input
            type="number"
            v-model="localSearchQuery.id"
            :placeholder="$t('search.byId')"
            class="p-2 border rounded-md"
            @keyup.enter="handleSearch"
        />
        <div class="flex space-x-2">
          <button @click="handleSearch" class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            {{ $t('search.find') }}
          </button>
          <button @click="handleReset" class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
            {{ $t('search.reset') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center">
      <BaseSpinner />
      <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
    </div>

    <!-- Сообщение, если нет данных -->
    <div v-else-if="!store.dishCategories || store.dishCategories.length === 0" class="text-center text-gray-500">
      {{ $t('messages.noData') }}
    </div>

    <!-- Таблица с данными -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <!-- Пустой заголовок для цветной полосы -->
            <th class="w-10 p-0 border-gray-200 bg-gray-100"></th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('name') }}</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('refs.measurement_unit') }}</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('actions.operations') }}</th>
          </tr>
        </thead>
        <tbody>
          <!-- [ИЗМЕНЕНО] Обертка для применения border-collapse -->
          <tr v-for="category in store.dishCategories" :key="category.id" @click="viewRecord(category.id)"
              class="cursor-pointer hover:bg-gray-100 border-b border-gray-200">
            
            <!-- [ИЗМЕНЕНО] Цветная полоса на всю высоту -->
            <td class="p-0 w-2" :style="{ backgroundColor: category.color }"></td>

            <td class="px-5 py-4 bg-white text-sm">{{ locale === 'kz' ? category.name_kz : category.name_ru }}</td>
            <td class="px-5 py-4 bg-white text-sm">{{ getUnitName(category.measurement_unit) }}</td>
            <td class="px-5 py-4 bg-white text-sm">
              <div class="flex items-center space-x-4">
                <NuxtLink :to="localePath(`/dishes-categories/${category.id}/edit`)" @click.stop class="text-indigo-600 hover:text-indigo-900">
                  <Pencil class="w-5 h-5"/>
                </NuxtLink>
                <button @click.stop="confirmDelete(category.id)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-5 h-5"/>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Компонент пагинации -->
      <div v-if="store.totalRecords > 0" class="p-4 flex items-center justify-between border-t">
        <p class="text-sm text-gray-700">
          {{ $t('pagination.showing', {
          from: (store.currentPage - 1) * store.pageSize + 1,
          to: Math.min(store.currentPage * store.pageSize, store.totalRecords),
          total: store.totalRecords
        })
          }}
        </p>
        <div class="flex space-x-1">
          <button
              @click="goToPage(store.currentPage - 1)"
              :disabled="store.currentPage === 1"
              class="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('pagination.prev') }}
          </button>
          <span class="px-3 py-1 text-sm">
            {{ $t('pagination.page', { current: store.currentPage, total: store.totalPages }) }}
          </span>
          <button
              @click="goToPage(store.currentPage + 1)"
              :disabled="store.currentPage >= store.totalPages"
              class="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('pagination.next') }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseSpinner from '~/components/BaseSpinner.vue';
import { useDishCategoriesStore } from '~/stores/dishCategories';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import { Pencil, Trash2 } from 'lucide-vue-next';

// --- Подключение composables ---
const router = useRouter();
const store = useDishCategoriesStore();
const unitsStore = useMeasurementUnitsStore();
const { t, locale } = useI18n();
const localePath = useLocalePath();

// --- Функции ---

// Локальное состояние для полей ввода, чтобы не дергать хранилище при каждом нажатии клавиши
const localSearchQuery = ref({
  name_kz: store.searchQuery.name_kz,
  name_ru: store.searchQuery.name_ru,
  id: store.searchQuery.id,
});

// --- Наблюдатели для очистки других полей ---
watch(() => localSearchQuery.value.name_kz, (newValue) => {
  if (newValue) {
    localSearchQuery.value.name_ru = '';
    localSearchQuery.value.id = '';
  }
});

watch(() => localSearchQuery.value.name_ru, (newValue) => {
  if (newValue) {
    localSearchQuery.value.name_kz = '';
    localSearchQuery.value.id = '';
  }
});

watch(() => localSearchQuery.value.id, (newValue) => {
  if (newValue) {
    localSearchQuery.value.name_kz = '';
    localSearchQuery.value.name_ru = '';
  }
});

// Функция для запуска поиска
function handleSearch() {
  // Обновляем состояние в хранилище перед запросом
  store.searchQuery.name_kz = localSearchQuery.value.name_kz;
  store.searchQuery.name_ru = localSearchQuery.value.name_ru;
  store.searchQuery.id = localSearchQuery.value.id;
  // Запускаем поиск с первой страницы
  store.fetchRecords(1);
}

// Функция для сброса поиска
function handleReset() {
  localSearchQuery.value = { name_kz: '', name_ru: '', id: '' };
  handleSearch();
}

// Функция для смены страницы
function goToPage(page: number) {
  if (page < 1 || page > store.totalPages) {
    return;
  }
  store.fetchRecords(page);
}

function viewRecord(id: number) {
  router.push(localePath(`/dishes-categories/${id}`));
}

function confirmDelete(id: number) {
  if (window.confirm(t('actions.confirmDelete'))) {
    store.deleteRecord(id);
  }
}

function getUnitName(unitId: number | null): string {
    if (!unitId) return '---';
    const unit = unitsStore.measurementUnits.find(u => u.id === unitId);
    if (!unit) return String(unitId);
    return locale.value === 'kz' ? unit.name_kz : unit.name_ru;
}

onMounted(() => {
  store.fetchRecords(store.currentPage);
  unitsStore.fetchRecords();
});
</script>
