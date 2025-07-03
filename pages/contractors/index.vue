<template>
  <div class="container mx-auto p-4">
    <!-- Заголовок страницы и кнопка создания -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ $t('contractors') }}</h1>
      <NuxtLink :to="localePath('/contractors/create')"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>
    
    <!-- Форма поиска -->
    <div class="p-4 bg-white rounded-lg shadow mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          type="text" 
          v-model="localSearchQuery.name"
          :placeholder="$t('search.byName')"
          class="p-2 border rounded-md"
          @keyup.enter="handleSearch"
        />
        <input 
          type="text" 
          v-model="localSearchQuery.bin"
          :placeholder="$t('search.byBin')"
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
    
    <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center">
      <BaseSpinner />
      <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
    </div>

    <!-- Сообщение, если нет данных -->
    <div v-else-if="!store.contractors || store.contractors.length === 0" class="text-center text-gray-500">
       {{ $t('messages.noData') }}
    </div>

    <!-- Таблица с данными -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
              ID
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {{ $t('name') }}
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {{ $t('contractor.bin') }}
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {{ $t('actions.operations') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contractor in store.contractors" :key="contractor.id" @click="viewContractor(contractor.id)"
              class="cursor-pointer hover:bg-gray-100">
            
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ contractor.id }}
            </td>
            
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">
                {{ contractor.name }}
              </p>
            </td>

            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">
                {{ contractor.bin }}
              </p>
            </td>

            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div class="flex items-center space-x-4">
                <NuxtLink :to="localePath(`/contractors/${contractor.id}/edit`)" @click.stop
                          class="text-indigo-600 hover:text-indigo-900">
                  <Pencil class="w-5 h-5"/>
                </NuxtLink>
                <button @click.stop="confirmDelete(contractor.id)" class="text-red-600 hover:text-red-900">
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

<script setup>
import { useContractorsStore } from '~/stores/contractors';
const uiStore = useUiStore();
import BaseSpinner from '~/components/BaseSpinner.vue';
import { Pencil, Trash2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

// --- Подключение composables ---
const router = useRouter();
const localePath = useLocalePath();
const store = useContractorsStore();
const { t } = useI18n();

// --- Функции ---

// Локальное состояние для полей ввода, чтобы не дергать хранилище при каждом нажатии клавиши
const localSearchQuery = ref({
  name: store.searchQuery.name,
  bin: store.searchQuery.bin,
  id: store.searchQuery.id,
});

// --- Наблюдатели для очистки других полей ---
watch(() => localSearchQuery.value.name, (newValue) => {
  if (newValue) {
    localSearchQuery.value.bin = '';
    localSearchQuery.value.id = '';
  }
});

watch(() => localSearchQuery.value.bin, (newValue) => {
  if (newValue) {
    localSearchQuery.value.name = '';
    localSearchQuery.value.id = '';
  }
});

watch(() => localSearchQuery.value.id, (newValue) => {
  if (newValue) {
    localSearchQuery.value.name = '';
    localSearchQuery.value.bin = '';
  }
});

// Функция для запуска поиска
function handleSearch() {
  const binValue = localSearchQuery.value.bin;

  // Проверяем БИН, только если поле не пустое
  if (binValue) {
    // Проверка, что строка состоит ровно из 12 цифр
    if (!/^\d{12}$/.test(binValue)) {
      uiStore.showNotification({
        message: t('validation.invalidBin'),
        type: 'warning',
      });
      return; // Прерываем поиск, если валидация не пройдена
    }
  }

  // Обновляем состояние в хранилище перед запросом
  store.searchQuery.name = localSearchQuery.value.name;
  store.searchQuery.bin = localSearchQuery.value.bin;
  store.searchQuery.id = localSearchQuery.value.id;
  // Запускаем поиск с первой страницы
  store.fetchRecords(1);
}

// Функция для сброса поиска
function handleReset() {
  localSearchQuery.value = { name: '', bin: '', id: '' };
  handleSearch();
}

// Функция для смены страницы
function goToPage(page) {
  if (page < 1 || page > store.totalPages) {
    return;
  }
  store.fetchRecords(page);
}

/**
 * Переход на страницу детального просмотра
 * @param {number} id - ID контрагента
 */
function viewContractor(id) {
  router.push(localePath(`/contractors/${id}`));
}

/**
 * Запрос подтверждения и удаление
 * @param {number} id - ID контрагента
 */
function confirmDelete(id) {
  if (window.confirm(t('actions.confirmDelete'))) {
    store.deleteRecord(id);
  }
}

// При монтировании компонента запускаем загрузку первой страницы
onMounted(() => {
  // При возврате со страницы просмотра currentPage будет равен той странице, с которой ушли.
  store.fetchRecords(store.currentPage);
});
</script>
