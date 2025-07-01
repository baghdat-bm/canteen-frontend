<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('refs.writingOffReason') }}</h1>
      
      <!-- Индикатор загрузки -->
      <div v-if="store.isLoading" class="text-center">
        <p>{{ $t('loading') }}</p>
      </div>

      <!-- Форма в белой карточке -->
      <div v-else-if="store.writingOffReason" class="bg-white p-8 rounded-lg shadow-md">
        <WritingOffReasonForm 
          :writing-off-reason="store.writingOffReason" 
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
import { useWritingOffReasonsStore } from '~/stores/writingOffReasons';
import type { WritingOffReasonPayload } from '~/stores/writingOffReasons';
import WritingOffReasonForm from '~/components/writing-off-reasons/WritingOffReasonForm.vue';

// --- Подключение composables ---
const store = useWritingOffReasonsStore();
const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const isSubmitting = ref(false);

// --- Вычисляемые свойства ---
const id = Number(route.params.id);

// --- Функции ---

/**
 * Обработчик отправки формы для обновления данных
 * @param {WritingOffReasonPayload} formData - Данные из формы
 */
const handleSubmit = async (formData: WritingOffReasonPayload) => {
  if (isNaN(id)) return;

  isSubmitting.value = true;
  try {
    await store.updateRecord(id, formData);    
    await navigateTo(localePath('/writing-off-reasons'));
  } catch (error) {
    console.error('Failed to update writing-off-reasons:', error);    
    alert(t('message.couldntCreateWritingOffReason'));
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
