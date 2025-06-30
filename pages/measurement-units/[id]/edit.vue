<template>
  <div class="container mx-auto p-4">
     <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('refs.editMeasurementUnit') }}</h1>
       <div v-if="store.loading" class="text-center">
        <p>{{ $t('loading') }}</p>
      </div>
       <div v-else-if="store.measurementUnit" class="bg-white p-8 rounded-lg shadow-md">
          <MeasurementUnitForm :measurement-unit="store.measurementUnit" @submit="handleSubmit" />
       </div>
       <div v-else class="text-center">
         <p>{{ $t('messages.couldntUploadEditingData') }}.</p>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMeasurementUnitsStore, type MeasurementUnitPayload } from '~/stores/measurementUnits';
import MeasurementUnitForm from '~/components/measurement-units/MeasurementUnitForm.vue';


const store = useMeasurementUnitsStore();
const route = useRoute();
const id = Number(route.params.id);

// Обработчик отправки формы
const handleSubmit = (formData: MeasurementUnitPayload) => {
  if (!isNaN(id)) {
    store.updateMeasurementUnit(id, formData);
  }
};

// Загружаем данные при монтировании
onMounted(() => {
  if (!isNaN(id)) {
      store.fetchMeasurementUnit(id);
  }
});
</script>