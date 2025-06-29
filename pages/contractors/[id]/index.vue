<template>
  <div v-if="contractor">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{{ contractor.name }}</h1>
      <NuxtLink :to="localePath(`/contractors/${contractor.id}/edit`)" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
        {{ $t('edit') }}
      </NuxtLink>
    </div>
    <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6 space-y-2">
      <p><strong>ID:</strong> {{ contractor.id }}</p>
      <p><strong>{{ $t('refs.bik') }}:</strong> {{ contractor.bik }}</p>
      <p><strong>Банк:</strong> {{ contractor.bank }}</p>
      <p><strong>{{ $t('refs.corr_account') }}:</strong> {{ contractor.corr_account }}</p>
      <p><strong>{{ $t('refs.check_account') }}:</strong> {{ contractor.check_account }}</p>
    </div>
  </div>
  <div v-else class="text-center">
    Контрагент {{ $t('refs.not_found_or_loading') }}
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useContractorsStore } from '~/stores/contractors';

const route = useRoute();
const store = useContractorsStore();
const localePath = useLocalePath();
const { t } = useI18n();

// Получаем ID из URL
const contractorId = computed(() => Number(route.params.id));

// Получаем данные контрагента из store
const contractor = computed(() => store.getContractorById(contractorId.value));

// Загружаем список, если его еще нет (например, если зашли сразу по прямой ссылке)
await useAsyncData('contractor-details', () => store.fetchContractors());
</script>