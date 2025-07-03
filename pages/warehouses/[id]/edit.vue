<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('warehouse.refName') }}</h1>
      
      <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center">
        <BaseSpinner />
        <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
      </div>

      <!-- Форма в белой карточке -->
      <div v-else-if="store.warehouse" class="bg-white p-8 rounded-lg shadow-md">
        <WarehouseForm 
          :warehouse="store.warehouse" 
          @submit="handleSubmit" 
          :is-submitting="isSubmitting"
        />
      </div>

      <!-- Сообщение, если данные не найдены -->
      <div v-else class="text-center">
        <p>{{ $t('messages.couldntUploadEditingData') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useWarehouseStore } from '~/stores/warehouses';
import type { WarehousePayload } from '~/stores/warehouses';
import BaseSpinner from '~/components/BaseSpinner.vue';
import WarehouseForm from '~/components/warehouses/WarehouseForm.vue';

// --- Подключение composables ---
const store = useWarehouseStore();
const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const isSubmitting = ref(false);
const uiStore = useUiStore(); 

// --- Вычисляемые свойства ---
const id = Number(route.params.id);

// --- Функции ---

/**
 * Обработчик отправки формы для обновления данных
 * @param {WarehousePayload} formData - Данные из формы
 */
const handleSubmit = async (formData: WarehousePayload) => {
  if (isNaN(id)) return;

  isSubmitting.value = true;
  try {
    await store.updateRecord(id, formData);    
    await navigateTo(localePath('/warehouses'));
  } catch (error) {
    console.error('Failed to update warehouse:', error);    
    uiStore.showNotification({
        message: t('warehouse.couldntUpdateItem'),
        type: 'error',
        duration: 7000
    });
  } finally {
    isSubmitting.value = false;
  }
};

// --- Хуки жизненного цикла ---
// Загружаем данные при монтировании компонента
onMounted(() => {
  if (!isNaN(id)) {
    store.fetchRecord(id);
  }
});
</script>
