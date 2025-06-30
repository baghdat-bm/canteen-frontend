<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('refs.createMeasurementUnit') }}</h1>
      <div class="bg-white p-8 rounded-lg shadow-md">
        <MeasurementUnitForm @submit="handleSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import type { MeasurementUnitPayload } from '~/stores/measurementUnits';
import MeasurementUnitForm from '~/components/measurement-units/MeasurementUnitForm.vue';

const store = useMeasurementUnitsStore();
const { t } = useI18n();
const localePath = useLocalePath();

// Обработчик отправки формы
const handleSubmit = async (formData: MeasurementUnitPayload) => {
  try {
    await store.createMeasurementUnit(formData);
    await navigateTo(localePath('/measurement-units'));
  }
  catch (error) {
    console.error('Failed to create measurement unit:', error);    
    alert(t('message.couldntCreateMeasurementUnit'));
  }
};
</script>