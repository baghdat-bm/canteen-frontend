<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ $t('dishCategory.itemList') }}</h1>
      <NuxtLink :to="localePath('/dishes-categories/create')" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>

    <div v-if="store.isLoading" class="text-center">
      <p>{{ $t('message.loading') }}</p>
    </div>

    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <!-- Пустой заголовок для цветной полосы -->
            <th class="w-10 p-0 border-gray-200 bg-gray-100"></th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('name') }}</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('refs.measurement_units') }}</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('actions.operations') }}</th>
          </tr>
        </thead>
        <tbody>
          <!-- [ИЗМЕНЕНО] Обертка для применения border-collapse -->
          <tr v-for="category in store.dishCategories" :key="category.id" @click="viewRecord(category.id)"
              class="cursor-pointer hover:bg-gray-100 border-b border-gray-200">
            
            <!-- [ИЗМЕНЕНО] Цветная полоса на всю высоту -->
            <td class="p-0 w-2" :style="{ backgroundColor: category.color }"></td>

            <td class="px-5 py-4 bg-white text-sm font-medium">{{ locale === 'kz' ? category.name_kz : category.name_ru }}</td>
            <td class="px-5 py-4 bg-white text-sm">{{ getUnitName(category.measurement_unit) }}</td>
            <td class="px-5 py-4 bg-white text-sm">
              <div class="flex items-center space-x-4">
                <NuxtLink :to="localePath(`/dishes-categories/${category.id}/edit`)" @click.stop class="text-indigo-600 hover:text-indigo-900">
                  <Pencil class="w-5 h-5"/>
                </NuxtLink>
                <button @click.stop="confirmDelete(category.id)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-5 h-5"/>
                </button>
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
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDishCategoriesStore } from '~/stores/dishCategories';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import { Pencil, Trash2 } from 'lucide-vue-next';

const router = useRouter();
const store = useDishCategoriesStore();
const unitsStore = useMeasurementUnitsStore();
const { t, locale } = useI18n();
const localePath = useLocalePath();

function viewRecord(id: number) {
  router.push(localePath(`/dishes-categories/${id}`));
}

function confirmDelete(id: number) {
  if (window.confirm(t('actions.confirmDelete'))) {
    store.deleteRecord(id);
  }
}

function getUnitName(unitId: number | null): string {
    if (!unitId) return '---';
    const unit = unitsStore.measurementUnits.find(u => u.id === unitId);
    if (!unit) return String(unitId);
    return locale.value === 'kz' ? unit.name_kz : unit.name_ru;
}

onMounted(() => {
  store.fetchRecords();
  unitsStore.fetchMeasurementUnits();
});
</script>
