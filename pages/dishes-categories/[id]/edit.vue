<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('dishCategory.refName') }}</h1>
      
      <div v-if="store.isLoading || unitsStore.isLoading" class="text-center">
        <p>{{ $t('loading') }}</p>
      </div>
      
      <div v-else-if="store.dishCategory" class="bg-white p-8 rounded-lg shadow-md">
        <DishCategoryForm 
          :initial-data="store.dishCategory"
          :measurement-units="unitsStore.measurementUnits"
          :is-submitting="isSubmitting"
          @submit="handleSubmit" 
        />
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
import { useDishCategoriesStore, type DishCategoryPayload } from '~/stores/dishCategories';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import DishCategoryForm from '~/components/dishes-categories/DishCategoryForm.vue';

const store = useDishCategoriesStore();
const unitsStore = useMeasurementUnitsStore();
const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const isSubmitting = ref(false);
const id = Number(route.params.id);

async function handleSubmit(formData: DishCategoryPayload) {
  if (isNaN(id)) return;
  isSubmitting.value = true;
  try {
    await store.updateRecord(id, formData);
    await navigateTo(localePath('/dishes-categories'));
  } catch (error) {
    alert(t('dishCategory.couldntUpdateItem'));
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  if (!isNaN(id)) {
    store.fetchRecord(id);
  }
  unitsStore.fetchMeasurementUnits();
});
</script>
