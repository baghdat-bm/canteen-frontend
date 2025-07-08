<template>
  <div class="container mx-auto">
    <!-- Заголовок страницы и кнопка создания -->
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-bold">{{ $t('refs.writingOffReasons') }}</h1>
      <NuxtLink :to="localePath('/writing-off-reasons/create')"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
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

    <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center">
      <BaseSpinner />
      <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
    </div>

    <!-- Сообщение, если нет данных -->
    <div v-else-if="!store.writingOffReasons || store.writingOffReasons.length === 0" class="text-center text-gray-500">
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
              {{ $t('actions.operations') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.writingOffReasons" :key="item.id" @click="viewRecord(item.id)"
            class="cursor-pointer hover:bg-gray-100 transition-colors">

            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              {{ item.id }}
            </td>

            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              <!-- Отображение названия в зависимости от текущей локали -->
              <p class="text-gray-900 whitespace-no-wrap">
                {{ locale === 'kz' ? item.name_kz : item.name_ru }}
              </p>
            </td>

            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              <!-- Кнопки действий с иконками -->
              <div class="flex items-center space-x-4">
                <NuxtLink :to="localePath(`/writing-off-reasons/${item.id}/edit`)" @click.stop
                  class="text-indigo-600 hover:text-indigo-900">
                  <Pencil class="w-5 h-5" />
                </NuxtLink>
                <button @click.stop="confirmDelete(item)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-5 h-5" />
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
                     :message="$t('writingOffReason.confirmDelete')"
                     :confirm-button-text="$t('actions.delete')"
                     @confirm="deleteItemConfirmed"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useRouter } from 'vue-router';
import { useWritingOffReasonsStore, type WritingOffReason } from '~/stores/writingOffReasons';
import { useI18n } from 'vue-i18n';
import { Pencil, Trash2 } from 'lucide-vue-next';
import BaseSpinner from '~/components/BaseSpinner.vue';
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import BasePagination from "~/components/BasePagination.vue";

// --- Подключение composables ---
const router = useRouter();
const store = useWritingOffReasonsStore();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const showDeleteModal = ref(false);
const itemToDelete = ref<WritingOffReason | null>(null);

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

/**
 * Переход на страницу детального просмотра записи
 * @param {number} id - ID записи
 */
const viewRecord = (id: number) => {
  router.push(localePath(`/writing-off-reasons/${id}`));
};

const confirmDelete = (item: WritingOffReason) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const deleteItemConfirmed = async () => {
  if (itemToDelete.value) {
    const success = await store.deleteRecord(itemToDelete.value.id);
    if (success) {
      store.writingOffReasons = store.writingOffReasons.filter(d => d.id !== itemToDelete.value?.id);
    }
  }
};

// --- Хуки жизненного цикла ---
onMounted(() => {
  store.fetchRecords(store.currentPage);
});
</script>
