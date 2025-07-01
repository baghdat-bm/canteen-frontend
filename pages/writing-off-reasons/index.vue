<template>
  <div class="container mx-auto p-4">
    <!-- Заголовок страницы и кнопка создания -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ $t('refs.writingOffReasons') }}</h1>
      <NuxtLink :to="localePath('/writing-off-reasons/create')"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="store.isLoading" class="text-center">
      <p>{{ $t('loading') }}</p>
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
              class="cursor-pointer hover:bg-gray-100">
            
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ item.id }}
            </td>
            
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <!-- Отображение названия в зависимости от текущей локали -->
              <p class="text-gray-900 whitespace-no-wrap">
                {{ locale === 'kz' ? item.name_kz : item.name_ru }}
              </p>
            </td>

            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <!-- Кнопки действий с иконками -->
              <div class="flex items-center space-x-4">
                <NuxtLink :to="localePath(`/writing-off-reasons/${item.id}/edit`)" @click.stop
                          class="text-indigo-600 hover:text-indigo-900">
                  <Pencil class="w-5 h-5"/>
                </NuxtLink>
                <button @click.stop="confirmDelete(item.id)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-5 h-5"/>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWritingOffReasonsStore } from '~/stores/writingOffReasons';
import { useI18n } from 'vue-i18n';
import { Pencil, Trash2 } from 'lucide-vue-next';

// --- Подключение composables ---
const router = useRouter();
const store = useWritingOffReasonsStore();
const { t, locale } = useI18n();
const localePath = useLocalePath();

// --- Функции ---

/**
 * Переход на страницу детального просмотра записи
 * @param {number} id - ID записи
 */
const viewRecord = (id: number) => {
  router.push(localePath(`/writing-off-reasons/${id}`));
};

/**
 * Запрос подтверждения и вызов действия удаления
 * @param {number} id - ID записи
 */
const confirmDelete = (id: number) => {
  if (window.confirm(t('actions.confirmDelete'))) {
    store.deleteRecord(id);
  }
};

// --- Хуки жизненного цикла ---
onMounted(() => {
  store.fetchRecords();
});
</script>
