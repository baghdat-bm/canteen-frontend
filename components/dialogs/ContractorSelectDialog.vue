<template>
  <!-- Внешний контейнер и фон -->
  <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
  >
    <div
        v-if="modelValue"
        ref="overlay"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        class="fixed inset-0 bg-gray-700 bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    >
      <!-- Анимация появления самого окна -->
      <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
      >
        <div v-if="modelValue" class="p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <!-- Заголовок окна -->
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">{{ $t('contractor.selectOne') }}</h3>

          <!-- Фильтры поиска внутри диалога -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
                type="text"
                v-model="localSearch.name"
                :placeholder="$t('search.byName')"
                class="p-2 border rounded-md"
                @keyup.enter="runSearch"
            />
            <input
                type="text"
                v-model="localSearch.bin"
                :placeholder="$t('search.byBin')"
                class="p-2 border rounded-md"
                @keyup.enter="runSearch"
            />
            <div class="flex space-x-2">
              <button @click="runSearch" class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                {{ $t('search.find') }}
              </button>
              <button @click="resetSearch" class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                {{ $t('search.reset') }}
              </button>
            </div>
          </div>

          <!-- Индикатор загрузки -->
          <div v-if="contractorsStore.isLoading" class="text-center p-8">
            <BaseSpinner />
            <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
          </div>

          <!-- Таблица с результатами -->
          <div v-else class="overflow-y-auto max-h-96">
            <table class="min-w-full leading-normal">
              <thead>
              <tr>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('name') }}</th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('contractor.bin') }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-if="contractorsStore.contractors.length === 0">
                <td colspan="3" class="text-center py-4 text-gray-500">{{ $t('messages.noData') }}</td>
              </tr>
              <tr v-for="contractor in contractorsStore.contractors" :key="contractor.id" @click="handleSelect(contractor)" class="cursor-pointer hover:bg-gray-100 transition-colors">
                <td class="px-5 py-4 border-b border-gray-200 text-sm">{{ contractor.id }}</td>
                <td class="px-5 py-4 border-b border-gray-200 text-sm">{{ contractor.name }}</td>
                <td class="px-5 py-4 border-b border-gray-200 text-sm">{{ contractor.bin }}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Пагинация -->
          <BasePagination
              v-if="!contractorsStore.isLoading && contractorsStore.contractors.length > 0"
              :total-records="contractorsStore.totalRecords"
              :page-size="contractorsStore.pageSize"
              :current-page="contractorsStore.currentPage"
              :total-pages="contractorsStore.totalPages"
              :is-loading="contractorsStore.isLoading"
              @page-changed="goToPage"
              class="mt-4"
          />

          <!-- Кнопка закрытия -->
          <div class="text-right mt-4">
            <button
                @click="handleCancel"
                class="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {{ $t('actions.close') }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useContractorsStore, type Contractor } from '~/stores/contractors';
import BaseSpinner from '~/components/BaseSpinner.vue';
import BasePagination from '~/components/BasePagination.vue';

interface Props {
  modelValue: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Выберите контрагента',
});

const emit = defineEmits(['update:modelValue', 'select']);

const contractorsStore = useContractorsStore();
const localSearch = ref({ name: '', bin: '' });

// --- ИЗМЕНЕНИЕ: Логика для корректного закрытия окна ---
const overlay = ref<HTMLElement | null>(null);
let isPotentialClose = false;

function onMouseDown(event: MouseEvent) {
  // Проверяем, что нажатие было именно на фоне, а не на дочерних элементах
  if (event.target === overlay.value) {
    isPotentialClose = true;
  }
}

function onMouseUp() {
  // Если и нажатие, и отпускание были на фоне, то закрываем
  if (isPotentialClose) {
    handleCancel();
  }
  // В любом случае сбрасываем флаг
  isPotentialClose = false;
}
// --- КОНЕЦ ИЗМЕНЕНИЯ ---

// Запускаем поиск при открытии окна
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    contractorsStore.searchQuery.name = '';
    contractorsStore.searchQuery.bin = '';
    contractorsStore.searchQuery.id = '';
    contractorsStore.fetchRecords(1);
  }
});

function runSearch() {
  contractorsStore.searchQuery.name = localSearch.value.name;
  contractorsStore.searchQuery.bin = localSearch.value.bin;
  contractorsStore.searchQuery.id = '';
  contractorsStore.fetchRecords(1);
}

function resetSearch() {
  localSearch.value = { name: '', bin: '' };
  runSearch();
}

function goToPage(page: number) {
  contractorsStore.fetchRecords(page);
}

function handleSelect(contractor: Contractor) {
  emit('select', contractor);
  emit('update:modelValue', false);
}

function handleCancel() {
  emit('update:modelValue', false);
}
</script>
