<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">{{ $t('refs.createContractor') }}</h1>
      <div class="bg-white p-8 rounded-lg shadow-md">
        <ContractorForm @submit="handleCreate" :is-submitting="isSubmitting" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useContractorsStore } from '~/stores/contractors';
import ContractorForm from '~/components/contractors/ContractorForm.vue';

const store = useContractorsStore();
const router = useRouter();
const localePath = useLocalePath();
const isSubmitting = ref(false);
const { t } = useI18n();

async function handleCreate(formData) {
  isSubmitting.value = true;
  try {
    await store.createContractor(formData);
    // После успешного создания переходим на страницу списка
    await navigateTo(localePath('/contractors'));
  } catch (error) {
    console.error('Failed to create contractor:', error);
    alert(t('message.couldntCreateCounterparty'));
  } finally {
    isSubmitting.value = false;
  }
}
</script>