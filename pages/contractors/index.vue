<template>
  <div class="container mx-auto">
    <!-- Заголовок страницы и кнопка создания -->
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-bold">{{ $t('contractors') }}</h1>
      <NuxtLink :to="localePath('/contractors/create')"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>
    
    <!-- Форма поиска -->
    <div class="p-2 bg-white rounded-lg shadow mb-4">
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
              class="cursor-pointer hover:bg-gray-100 transition-colors">
            
            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              {{ contractor.id }}
            </td>
            
            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              <p class="text-gray-900 whitespace-no-wrap">
                {{ contractor.name }}
              </p>
            </td>

            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              <p class="text-gray-900 whitespace-no-wrap">
                {{ contractor.bin }}
              </p>
            </td>

            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              <div class="flex items-center space-x-4">
                <NuxtLink :to="localePath(`/contractors/${contractor.id}/edit`)" @click.stop
                          class="text-indigo-600 hover:text-indigo-900">
                  <Pencil class="w-5 h-5"/>
                </NuxtLink>
                <button @click.stop="confirmDelete(contractor)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-5 h-5"/>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Компонент пагинации -->
      <BasePagination
          :total-records="store.totalRecords"
          :page-size="store.pageSize"
          :current-page="store.currentPage"
          :total-pages="store.totalPages"
          :is-loading="store.isLoading"
          @page-changed="goToPage"
      />

    </div>

    <!-- Диалоговое окно подтверждения удаления-->
    <div class="p-4">
      <ConfirmDialog v-model="showDeleteModal"
                     :title="$t('captions.confirmDelete')"
                     :message="$t('contractor.confirmDelete')"
                     :confirm-button-text="$t('actions.delete')"
                     @confirm="deleteItemConfirmed"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useContractorsStore, type Contractor } from '~/stores/contractors';
import BaseSpinner from '~/components/BaseSpinner.vue';
import BasePagination from '~/components/BasePagination.vue';
import { Pencil, Trash2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import {ref} from "vue";

// --- Подключение composables ---
const uiStore = useUiStore();
const router = useRouter();
const localePath = useLocalePath();
const store = useContractorsStore();
const { t } = useI18n();
const showDeleteModal = ref(false);
const itemToDelete = ref<Contractor | null>(null);

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

function confirmDelete(item: Contractor) {
  itemToDelete.value = item;
  showDeleteModal.value = true;
}

const deleteItemConfirmed = async () => {
  if (itemToDelete.value) {
    const success = await store.deleteRecord(itemToDelete.value.id);
    if (success) {
      store.contractors = store.contractors.filter(d => d.id !== itemToDelete.value?.id);
    }
  }
};

// При монтировании компонента запускаем загрузку первой страницы
onMounted(() => {
  // При возврате со страницы просмотра currentPage будет равен той странице, с которой ушли.
  store.fetchRecords(store.currentPage);
});
</script>
