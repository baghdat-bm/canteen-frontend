<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">{{ $t('refs.edit_contractor') }}</h1>
    <ContractorForm v-if="contractor" :initial-data="contractor" @submit="handleUpdate" :is-submitting="isSubmitting" />
    <div v-else>{{ $t('loading') }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useContractorsStore } from '~/stores/contractors';
import ContractorForm from '~/components/contractors/ContractorForm.vue';

const store = useContractorsStore();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const isSubmitting = ref(false);
const { t } = useI18n();

const contractorId = computed(() => Number(route.params.id));
const contractor = computed(() => store.getContractorById(contractorId.value));

async function handleUpdate(formData) {
  isSubmitting.value = true;
  try {
    await store.updateContractor(contractorId.value, formData);
    // После успешного обновления переходим на страницу деталей
    router.push(localePath(`/contractors/${contractorId.value}`));
  } catch (error) {
    alert('Не удалось обновить контрагента');
  } finally {
    isSubmitting.value = false;
  }
}

// Загружаем список, если данные еще не загружены
await useAsyncData('contractor-edit', () => store.fetchContractors());
</script>