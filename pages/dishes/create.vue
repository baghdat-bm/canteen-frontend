<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('dish.refName') }}</h1>
      <div v-if="unitsStore.isLoading" class="text-center"><p>{{ $t('loading') }}</p></div>
      <div v-else class="bg-white p-8 rounded-lg shadow-md">
        <DishForm 
          :measurement-units="unitsStore.measurementUnits"
          :categories="dishCategoriesStore.dishCategories"
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
import { useDishStore, type DishPayload } from '~/stores/dishes';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import { useDishCategoriesStore } from '~/stores/dishCategories';
import DishForm from '~/components/dishes/DishForm.vue';

const store = useDishStore();
const unitsStore = useMeasurementUnitsStore();
const dishCategoriesStore = useDishCategoriesStore();
const { t } = useI18n();
const localePath = useLocalePath();
const isSubmitting = ref(false);

async function handleSubmit(formData: DishPayload) {
  isSubmitting.value = true;
  try {
    await store.createRecord(formData);
    await navigateTo(localePath('/dishes'));
  } catch (error) {
    alert(t('message.couldNotCreate'));
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  unitsStore.fetchRecords();
  dishCategoriesStore.fetchRecords();
});
</script>
