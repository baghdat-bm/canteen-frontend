<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
       <h1 class="text-2xl font-bold mb-6">{{ $t('dishCategory.refName') }}</h1>
       
        <div v-if="store.isLoading" class="text-center"><p>{{ $t('loading') }}</p></div>
        
        <div v-else-if="store.dishCategory" class="bg-white p-8 rounded-lg shadow-md">
            <div class="space-y-4">
              <div class="flex items-baseline"><span class="w-1/3 text-gray-500 font-semibold">ID</span><p class="w-2/3 text-gray-900">{{ store.dishCategory.id }}</p></div>
              <div class="flex items-baseline"><span class="w-1/3 text-gray-500 font-semibold">{{ $t('name_ru') }}</span><p class="w-2/3 text-gray-900">{{ store.dishCategory.name_ru }}</p></div>
              <div class="flex items-baseline"><span class="w-1/3 text-gray-500 font-semibold">{{ $t('name_kz') }}</span><p class="w-2/3 text-gray-900">{{ store.dishCategory.name_kz }}</p></div>
              <div class="flex items-baseline"><span class="w-1/3 text-gray-500 font-semibold">{{ $t('name_en') }}</span><p class="w-2/3 text-gray-900">{{ store.dishCategory.name_en }}</p></div>
              <div class="flex items-center"><span class="w-1/3 text-gray-500 font-semibold">{{ $t('refs.measurement_units') }}</span><p class="w-2/3 text-gray-900">{{ getUnitName(store.dishCategory.measurement_unit) }}</p></div>
              <div class="flex items-center"><span class="w-1/3 text-gray-500 font-semibold">{{ $t('refs.color') }}</span><div class="w-8 h-8 rounded-full border" :style="{ backgroundColor: store.dishCategory.color }"></div></div>
              <div class="flex items-start"><span class="w-1/3 text-gray-500 font-semibold pt-2">{{ $t('refs.logo') }}</span><img v-if="store.dishCategory.logo" :src="store.dishCategory.logo" class="w-24 h-24 rounded-lg object-cover border"></div>
            </div>
            
             <div class="mt-8 flex justify-end space-x-4">
                <NuxtLink :to="localePath('/dishes-categories')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">{{ $t('navigation.backToList') }}</NuxtLink>
                <NuxtLink :to="localePath(`/dishes-categories/${route.params.id}/edit`)" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{{ $t('actions.edit') }}</NuxtLink>
            </div>
        </div>
        
         <div v-else class="text-center text-gray-500"><p>{{ $t('messages.notFound') }}</p></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDishCategoriesStore } from '~/stores/dishCategories';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';

const store = useDishCategoriesStore();
const unitsStore = useMeasurementUnitsStore();
const route = useRoute();
const { locale } = useI18n();
const localePath = useLocalePath();

function getUnitName(unitId: number | null): string {
    if (!unitId) return '---';
    const unit = unitsStore.measurementUnits.find(u => u.id === unitId);
    if (!unit) return String(unitId);
    return locale.value === 'kz' ? unit.name_kz : unit.name_ru;
}

onMounted(() => {
    const id = Number(route.params.id);
    if (!isNaN(id)) {
        store.fetchRecord(id);
    }
    unitsStore.fetchMeasurementUnits();
});
</script>
