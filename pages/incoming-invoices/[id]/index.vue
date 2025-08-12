<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Контрагент</h1>

      <!-- Используем pending из useAsyncData для индикации загрузки -->
      <div v-if="pending" class="bg-white rounded-lg shadow p-8 text-center">
        <BaseSpinner />
        <p class="mt-2 text-gray-600">{{ $t('message.loading') }}</p>
      </div>
      
      <!-- Карта с данными -->
      <div v-else-if="store.contractor" class="bg-white p-8 rounded-lg shadow-md">
        <div class="space-y-4">
          <!-- ID -->
          <div class="flex items-baseline">
            <span class="w-1/3 text-gray-500 font-semibold">ID</span>
            <p class="w-2/3 text-gray-900">{{ store.contractor.id }}</p>
          </div>
          
          <!-- Наименование -->
          <div class="flex items-baseline">
            <span class="w-1/3 text-gray-500 font-semibold">{{ $t('name') }}</span>
            <p class="w-2/3 text-gray-900">{{ store.contractor.name }}</p>
          </div>
          
          <!-- БИН -->
          <div class="flex items-baseline">
            <span class="w-1/3 text-gray-500 font-semibold">{{ $t('contractor.bin') }}</span>
            <p class="w-2/3 text-gray-900">{{ store.contractor.bin }}</p>
          </div>

          <!-- БИК -->
          <div class="flex items-baseline">
            <span class="w-1/3 text-gray-500 font-semibold">{{ $t('refs.bik') }}</span>
            <p class="w-2/3 text-gray-900">{{ store.contractor.bik }}</p>
          </div>

          <!-- Банк -->
          <div class="flex items-baseline">
            <span class="w-1/3 text-gray-500 font-semibold">Банк</span>
            <p class="w-2/3 text-gray-900">{{ store.contractor.bank }}</p>
          </div>

          <!-- Корр. счет -->
          <div class="flex items-baseline">
            <span class="w-1/3 text-gray-500 font-semibold">{{ $t('refs.corr_account') }}</span>
            <p class="w-2/3 text-gray-900">{{ store.contractor.corr_account }}</p>
          </div>
          
          <!-- Расчетный счет -->
          <div class="flex items-baseline">
            <span class="w-1/3 text-gray-500 font-semibold">{{ $t('refs.check_account') }}</span>
            <p class="w-2/3 text-gray-900">{{ store.contractor.check_account }}</p>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="mt-8 flex justify-end space-x-4">
          <NuxtLink :to="localePath('/contractors')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
            {{ $t('navigation.backToList') }}
          </NuxtLink>
          <NuxtLink :to="localePath(`/contractors/${store.contractor.id}/edit`)" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            {{ $t('actions.edit') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Сообщение, если данные не найдены -->
      <div v-else class="text-center text-gray-500">
        <p>{{ $t('messages.notFound') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useContractorsStore } from '~/stores/contractors';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseSpinner from '~/components/BaseSpinner.vue';

// --- Подключение composables ---
const route = useRoute();
const store = useContractorsStore();
const localePath = useLocalePath();
const { t } = useI18n();


// --- Вычисляемые свойства ---
// Получаем ID из URL
const contractorId = computed(() => Number(route.params.id));

// --- Загрузка данных ---
// useAsyncData обеспечивает загрузку и на сервере, и на клиенте
const { pending } = await useAsyncData(
    `contractor-${contractorId}`,
    () => {
      if (isNaN(contractorId.value)) {
        return Promise.resolve();
      }
      return store.fetchRecord(contractorId.value)
    },
    { watch: [() => route.params.id] } // Перезагружать данные, если ID в URL изменится
);
</script>
