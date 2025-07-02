<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('dishCategory.refName') }}</h1>
      <div v-if="unitsStore.isLoading" class="text-center"><p>{{ $t('loading') }}</p></div>
      <div v-else class="bg-white p-8 rounded-lg shadow-md">
        <DishCategoryForm 
          :measurement-units="unitsStore.measurementUnits"
          :is-submitting="isSubmitting"
          @submit="handleSubmit" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDishCategoriesStore, type DishCategoryPayload } from '~/stores/dishCategories';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import DishCategoryForm from '~/components/dishes-categories/DishCategoryForm.vue';

const store = useDishCategoriesStore();
const unitsStore = useMeasurementUnitsStore();
const { t } = useI18n();
const localePath = useLocalePath();
const isSubmitting = ref(false);

async function handleSubmit(formData: DishCategoryPayload) {
  isSubmitting.value = true;
  try {
    await store.createRecord(formData);
    await navigateTo(localePath('/dishes-categories'));
  } catch (error) {
    alert(t('message.couldNotCreate'));
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  unitsStore.fetchMeasurementUnits();
});
</script>
