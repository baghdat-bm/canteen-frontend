<template>
  <div class="container mx-auto">
    <!-- Заголовок страницы и кнопка создания -->
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-bold">{{ $t('warehouse.itemList') }}</h1>
      <NuxtLink :to="localePath('/warehouses/create')"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>

    <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center">
      <BaseSpinner />
      <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
    </div>

    <!-- Сообщение, если нет данных -->
    <div v-else-if="!store.warehouses || store.warehouses.length === 0" class="text-center text-gray-500">
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
          <tr v-for="item in store.warehouses" :key="item.id" @click="viewRecord(item.id)"
            class="cursor-pointer hover:bg-gray-100 transition-colors">

            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              {{ item.id }}
            </td>

            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              <p class="text-gray-900 whitespace-no-wrap">
                {{ item.name }}
              </p>
            </td>

            <td class="px-5 py-5 border-b border-gray-200 text-sm">
              <!-- Кнопки действий с иконками -->
              <div class="flex items-center space-x-4">
                <NuxtLink :to="localePath(`/warehouses/${item.id}/edit`)" @click.stop
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

    <!-- Модальное окно подтверждение удаления элемента -->
    <div class="p-4">
      <ConfirmDialog v-model="showDeleteModal"
                     :title="$t('captions.confirmDelete')"
                     :message="$t('warehouse.confirmDelete')"
                     :confirm-button-text="$t('actions.delete')"
                     @confirm="deleteItemConfirmed"/>
    </div>

  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useRouter } from 'vue-router';
import { useWarehouseStore, type Warehouse } from '~/stores/warehouses';
import { useI18n } from 'vue-i18n';
import { Pencil, Trash2 } from 'lucide-vue-next';
import BaseSpinner from '~/components/BaseSpinner.vue';
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import BasePagination from "~/components/BasePagination.vue";

// --- Подключение composables ---
const router = useRouter();
const store = useWarehouseStore();
const { t, locale } = useI18n();
const showDeleteModal = ref(false);
const itemToDelete = ref<Warehouse | null>(null);
const localePath = useLocalePath();

// --- Функции ---

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
  router.push(localePath(`/warehouses/${id}`));
};

const confirmDelete = (item: Warehouse) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const deleteItemConfirmed = async () => {
  if (itemToDelete.value) {
    const success = await store.deleteRecord(itemToDelete.value.id);
    if (success)
      store.warehouses = store.warehouses.filter(d => d.id !== itemToDelete.value?.id);
  }
};

// --- Хуки жизненного цикла ---
onMounted(() => {
  store.fetchRecords(store.currentPage);
});
</script>
