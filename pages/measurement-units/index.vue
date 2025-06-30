<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Единицы измерения</h1>
      <NuxtLink to="/measurement-units/create"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Создать
      </NuxtLink>
    </div>

    <div v-if="store.loading" class="text-center">
      <p>Загрузка...</p>
    </div>

    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              ID
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Наименование (RU)
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Наименование (KZ)
            </th>
             <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Наименование (EN)
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="unit in store.measurementUnits" :key="unit.id" class="hover:bg-gray-50">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ unit.id }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ unit.name_ru }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ unit.name_kz }}</p>
            </td>
             <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ unit.name_en }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div class="flex space-x-2">
                <NuxtLink :to="`/measurement-units/${unit.id}`" class="text-green-600 hover:text-green-900">Просмотр</NuxtLink>
                <NuxtLink :to="`/measurement-units/${unit.id}/edit`" class="text-indigo-600 hover:text-indigo-900">Изменить</NuxtLink>
                <button @click="store.deleteMeasurementUnit(unit.id)" class="text-red-600 hover:text-red-900">Удалить</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';

// Используем хранилище
const store = useMeasurementUnitsStore();

// Загружаем данные при монтировании компонента
onMounted(() => {
  store.fetchMeasurementUnits();
});
</script>