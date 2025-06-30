<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
       <h1 class="text-2xl font-bold mb-6">Просмотр единицы измерения</h1>
        <div v-if="store.loading" class="text-center">
            <p>Загрузка...</p>
        </div>
        <div v-else-if="store.measurementUnit" class="bg-white p-8 rounded-lg shadow-md">
            <div class="space-y-4">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">ID</h3>
                    <p class="mt-1 text-sm text-gray-900">{{ store.measurementUnit.id }}</p>
                </div>
                 <div>
                    <h3 class="text-sm font-medium text-gray-500">Наименование (RU)</h3>
                    <p class="mt-1 text-sm text-gray-900">{{ store.measurementUnit.name_ru }}</p>
                </div>
                 <div>
                    <h3 class="text-sm font-medium text-gray-500">Наименование (KZ)</h3>
                    <p class="mt-1 text-sm text-gray-900">{{ store.measurementUnit.name_kz }}</p>
                </div>
                 <div>
                    <h3 class="text-sm font-medium text-gray-500">Наименование (EN)</h3>
                    <p class="mt-1 text-sm text-gray-900">{{ store.measurementUnit.name_en }}</p>
                </div>
            </div>
             <div class="mt-8 flex justify-end space-x-4">
                <NuxtLink to="/measurement-units" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                  Назад к списку
                </NuxtLink>
                <NuxtLink :to="`/measurement-units/${route.params.id}/edit`" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Изменить
                </NuxtLink>
            </div>
        </div>
         <div v-else class="text-center text-gray-500">
            <p>Единица измерения не найдена.</p>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';

const store = useMeasurementUnitsStore();
const route = useRoute();

// Получаем ID из параметров маршрута и загружаем данные
onMounted(() => {
    const id = Number(route.params.id);
    if (!isNaN(id)) {
        store.fetchMeasurementUnit(id);
    }
});
</script>