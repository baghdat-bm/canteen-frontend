<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Создать единицу измерения</h1>
      <div class="bg-white p-8 rounded-lg shadow-md">
        <MeasurementUnitForm @submit="handleSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import type { MeasurementUnitPayload } from '~/stores/measurementUnits';
import MeasurementUnitForm from '~/components/measurement-units/MeasurementUnitForm.vue';

const store = useMeasurementUnitsStore();

// Обработчик отправки формы
const handleSubmit = (formData: MeasurementUnitPayload) => {
  store.createMeasurementUnit(formData);
};
</script>