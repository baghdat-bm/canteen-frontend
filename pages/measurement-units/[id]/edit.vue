<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('refs.editMeasurementUnit') }}</h1>
      
      <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center">
        <BaseSpinner />
        <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
      </div>

      <!-- Форма в белой карточке -->
      <div v-else-if="store.measurementUnit" class="bg-white p-8 rounded-lg shadow-md">
        <MeasurementUnitForm 
          :measurement-unit="store.measurementUnit" 
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
import { useMeasurementUnitsStore, type MeasurementUnitPayload } from '~/stores/measurementUnits';
import BaseSpinner from '~/components/BaseSpinner.vue';
import MeasurementUnitForm from '~/components/measurement-units/MeasurementUnitForm.vue';

// --- Подключение composables ---
const store = useMeasurementUnitsStore();
const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const isSubmitting = ref(false);

// --- Вычисляемые свойства ---
const id = Number(route.params.id);

// --- Функции ---

/**
 * Обработчик отправки формы для обновления данных
 * @param {MeasurementUnitPayload} formData - Данные из формы
 */
const handleSubmit = async (formData: MeasurementUnitPayload) => {
  if (isNaN(id)) return;

  isSubmitting.value = true;
  try {
    await store.updateMeasurementUnit(id, formData);    
    await navigateTo(localePath('/measurement-units'));
  } catch (error) {
    console.error('Failed to update measurement unit:', error);    
    alert(t('message.couldntUpdateMeasurementUnit'));
  } finally {
    isSubmitting.value = false;
  }
};

// --- Хуки жизненного цикла ---
// Загружаем данные при монтировании компонента
onMounted(() => {
  if (!isNaN(id)) {
    store.fetchMeasurementUnit(id);
  }
});
</script>
