<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Новый контрагент</h1>
    <ContractorForm @submit="handleCreate" :is-submitting="isSubmitting" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useContractorsStore } from '~/stores/contractors';
import ContractorForm from '~/components/contractors/ContractorForm.vue';

const store = useContractorsStore();
const router = useRouter();
const localePath = useLocalePath();
const isSubmitting = ref(false);

async function handleCreate(formData) {
  isSubmitting.value = true;
  try {
    await store.createContractor(formData);
    // После успешного создания переходим на страницу списка
    router.push(localePath('/contractors'));
  } catch (error) {
    // Здесь можно показать ошибку пользователю
    alert('Не удалось создать контрагента');
  } finally {
    isSubmitting.value = false;
  }
}
</script>