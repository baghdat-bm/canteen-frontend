<template>
  <!-- Компонент будет отображаться, только если есть записи для пагинации -->
  <div v-if="totalRecords > 0" class="p-4 flex items-center justify-between border-t">
    <!-- Информация о количестве записей -->
    <p class="text-sm text-gray-700">
      {{ $t('pagination.showing', {
      from: (currentPage - 1) * pageSize + 1,
      to: Math.min(currentPage * pageSize, totalRecords),
      total: totalRecords
    })
      }}
    </p>

    <!-- Кнопки управления -->
    <div class="flex items-center space-x-2">
      <button
          @click="$emit('page-changed', currentPage - 1)"
          :disabled="currentPage === 1 || isLoading"
          class="px-3 py-1 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer"
      >
        {{ $t('pagination.prev') }}
      </button>

      <span class="px-3 py-1 text-sm text-gray-700">
        {{ $t('pagination.page', { current: currentPage, total: totalPages }) }}
      </span>

      <button
          @click="$emit('page-changed', currentPage + 1)"
          :disabled="currentPage >= totalPages || isLoading"
          class="px-3 py-1 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer"
      >
        {{ $t('pagination.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

// --- Props ---
// Определяем, какие данные компонент ожидает от родителя
defineProps({
  totalRecords: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

// --- Emits ---
// Определяем, какие события компонент может отправлять родителю
defineEmits(['page-changed']);

// --- Подключение composables ---
const { t } = useI18n();
</script>
