<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('refs.edit_contractor') }}</h1>
      
      <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center">
        <BaseSpinner />
        <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
      </div>
      
      <!-- Форма в белой карточке -->
      <div v-else-if="contractor" class="bg-white p-8 rounded-lg shadow-md">
        <ContractorForm :initial-data="contractor" @submit="handleUpdate" :is-submitting="isSubmitting" />
      </div>
      
      <!-- Сообщение, если данные не найдены -->
      <div v-else class="text-center">
        <p>{{ $t('messages.couldntUploadEditingData') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useContractorsStore } from '~/stores/contractors';
import ContractorForm from '~/components/contractors/ContractorForm.vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseSpinner from '~/components/BaseSpinner.vue';

// --- Подключение composables ---
const store = useContractorsStore();
const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();
const isSubmitting = ref(false);

// --- Загрузка данных ---
const { pending } = await useAsyncData(
  'contractor-edit', 
  () => store.fetchContractors()
);

// --- Вычисляемые свойства ---
const contractorId = computed(() => Number(route.params.id));
const contractor = computed(() => store.getContractorById(contractorId.value));

// --- Функции ---
async function handleUpdate(formData) {
  isSubmitting.value = true;
  try {
    await store.updateRecord(contractorId.value, formData);
    // После успешного обновления переходим на страницу списка
    await navigateTo(localePath('/contractors'));
  } catch (error) {
    // В реальном приложении здесь лучше показать уведомление пользователю
    console.error('Failed to update contractor:', error);
    alert(t('message.couldntUpdateCounterparty'));
  } finally {
    isSubmitting.value = false;
  }
}
</script>
