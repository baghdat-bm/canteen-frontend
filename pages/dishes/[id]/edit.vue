<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('dish.refName') }}</h1>

      <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center">
        <BaseSpinner />
        <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
      </div>

      <div v-else-if="store.dish" class="bg-white p-8 rounded-lg shadow-md">
        <DishForm :initial-data="store.dish" :measurement-units="unitsStore.measurementUnits"
          :categories="categoriesStore.dishCategories" :is-submitting="isSubmitting" @submit="handleSubmit" />
      </div>

      <div v-else class="text-center">
        <p>{{ $t('messages.couldntUploadEditingData') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDishStore, type DishPayload } from '~/stores/dishes';
import { useDishCategoriesStore } from '~/stores/dishCategories';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import BaseSpinner from '~/components/BaseSpinner.vue';
import DishForm from '~/components/dishes/DishForm.vue';

const store = useDishStore();
const categoriesStore = useDishCategoriesStore();
const unitsStore = useMeasurementUnitsStore();
const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const isSubmitting = ref(false);
const id = Number(route.params.id);

async function handleSubmit(formData: DishPayload) {
  if (isNaN(id)) return;
  isSubmitting.value = true;
  try {
    await store.updateRecord(id, formData);
    await navigateTo(localePath('/dishes'));
  } catch (error) {
    alert(t('dish.couldntUpdateItem'));
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  if (!isNaN(id)) {
    store.fetchRecord(id);
  }
  unitsStore.fetchRecords();
  categoriesStore.fetchRecords();
});
</script>
