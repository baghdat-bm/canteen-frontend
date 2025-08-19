<template>
  <div class="container mx-auto">
    <!-- Заголовок страницы -->
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-bold">{{ $t('student.itemList') }}</h1>
      <!-- Кнопка создания отсутствует, так как модуль в режиме "только для чтения" -->
    </div>

    <!-- Форма поиска -->
    <div class="p-2 bg-white rounded-lg shadow mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
            type="text"
            v-model="localSearchQuery.full_name"
            :placeholder="$t('search.byFullName')"
            class="p-2 border border-gray-300 rounded-md"
            @keyup.enter="handleSearch"
        />
        <input
            type="text"
            v-model="localSearchQuery.iin"
            :placeholder="$t('search.byIin')"
            class="p-2 border border-gray-300 rounded-md"
            @keyup.enter="handleSearch"
        />
        <input
            type="number"
            v-model="localSearchQuery.id"
            :placeholder="$t('search.byId')"
            class="p-2 border border-gray-300 rounded-md"
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
    <div v-else-if="!store.students || store.students.length === 0" class="text-center text-gray-500 bg-white rounded-lg shadow p-8">
      {{ $t('messages.noData') }}
    </div>

    <!-- Таблица с данными -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
        <tr>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('student.photo') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('student.fullName') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('student.iin') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="student in store.students" :key="student.id" @click="viewStudent(student.id)"
            class="cursor-pointer hover:bg-gray-100 transition-colors">

          <td class="px-5 py-3 border-b border-gray-200 text-sm">
            <img :src="student.photo" alt="Photo" class="w-10 h-10 rounded-full object-cover" @error="onImageError">
          </td>
          <td class="px-5 py-3 border-b border-gray-200 text-sm">{{ student.id }}</td>
          <td class="px-5 py-3 border-b border-gray-200 text-sm">{{ student.full_name }}</td>
          <td class="px-5 py-3 border-b border-gray-200 text-sm">{{ student.iin }}</td>
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
  </div>
</template>

<script setup lang="ts">
import { useStudentsStore } from '~/stores/students';
import BaseSpinner from '~/components/BaseSpinner.vue';
import BasePagination from '~/components/BasePagination.vue';
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';

// --- Подключение composables ---
const router = useRouter();
const localePath = useLocalePath();
const store = useStudentsStore();

// --- Локальное состояние для фильтров ---
const localSearchQuery = ref({
  full_name: store.searchQuery.full_name,
  iin: store.searchQuery.iin,
  id: store.searchQuery.id,
});

// --- Функции ---
function handleSearch() {
  store.searchQuery.full_name = localSearchQuery.value.full_name;
  store.searchQuery.iin = localSearchQuery.value.iin;
  store.searchQuery.id = localSearchQuery.value.id;
  store.fetchRecords(1);
}

function handleReset() {
  localSearchQuery.value = { full_name: '', iin: '', id: '' };
  handleSearch();
}

function goToPage(page: number) {
  if (page >= 1 && page <= store.totalPages) {
    store.fetchRecords(page);
  }
}

function viewStudent(id: number) {
  router.push(localePath(`/students/${id}`));
}

// Заглушка для битых изображений
function onImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'https://via.placeholder.com/40'; // URL для заглушки
}

// При монтировании компонента запускаем загрузку первой страницы
onMounted(() => {
  store.fetchRecords(store.currentPage);
});
</script>
