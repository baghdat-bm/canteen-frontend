<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('warehouse.refName') }}</h1>
      <div class="bg-white p-8 rounded-lg shadow-md">
        <WarehouseForm @submit="handleSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWarehouseStore } from '~/stores/warehouses';
import type { WarehousePayload } from '~/stores/warehouses';
import WarehouseForm from '~/components/warehouses/WarehouseForm.vue';

const store = useWarehouseStore();
const { t } = useI18n();
const localePath = useLocalePath();
const uiStore = useUiStore(); 

// Обработчик отправки формы
const handleSubmit = async (formData: WarehousePayload) => {
  try {
    await store.createRecord(formData);
    await navigateTo(localePath('/warehouses'));
  }
  catch (error) {
    console.error('Failed to create warehouse:', error);        
    uiStore.showNotification({
        message: t('warehouse.couldntCreateItem'),
        type: 'error',
        duration: 7000
    });
  }
};
</script>