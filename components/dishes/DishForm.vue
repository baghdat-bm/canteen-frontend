<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <!-- Наименования -->
     <div>
      <label for="name_kz" class="block text-sm font-medium text-gray-700">{{ $t('name_kz') }}</label>
      <input type="text" v-model="formData.name_kz" id="name_kz" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>
    <div>
      <label for="name_ru" class="block text-sm font-medium text-gray-700">{{ $t('name_ru') }}</label>
      <input type="text" v-model="formData.name_ru" id="name_ru" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>    
    <div>
      <label for="name_en" class="block text-sm font-medium text-gray-700">{{ $t('name_en') }}</label>
      <input type="text" v-model="formData.name_en" id="name_en" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>

    <!-- Категория -->
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700">{{ $t('dishCategory.refName') }}</label>
      <select v-model="formData.category" id="category" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <option :value="null" disabled>{{ $t('messages.select') }}</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ locale === 'kz' ? category.name_kz : category.name_ru }}
        </option>
      </select>
    </div>

    <!-- Единица измерения -->
    <div>
      <label for="measurement_unit" class="block text-sm font-medium text-gray-700">{{ $t('refs.measurement_unit') }}</label>
      <select v-model="formData.measurement_unit" id="measurement_unit" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <option :value="null" disabled>{{ $t('messages.select') }}</option>
        <option v-for="unit in measurementUnits" :key="unit.id" :value="unit.id">
          {{ locale === 'kz' ? unit.name_kz : unit.name_ru }}
        </option>
      </select>
    </div>

    <!-- Логотип -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="logo" class="block text-sm font-medium text-gray-700">{{ $t('refs.logo') }}</label>
        <input type="file" @change="handleFileUpload" id="logo" class="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100">
        <img v-if="logoPreview" :src="logoPreview" alt="Preview" class="mt-4 h-20 w-20 object-cover rounded-md"/>
      </div>
    </div>

    <!-- Штрихкод -->
    <div>
      <label for="barcode" class="block text-sm font-medium text-gray-700">{{ $t('dish.barcode') }}</label>
      <input type="text" v-model="formData.barcode" id="barcode" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>

    <!-- Кнопки -->
    <div class="flex justify-end space-x-4 pt-4">
       <NuxtLink :to="localePath('/the-dishes')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
         {{ $t('actions.cancel') }}
       </NuxtLink>
      <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
        {{ isSubmitting ? $t('actions.saving') : $t('actions.save') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DishPayload, Dish } from '~/stores/dishes';
import type { MeasurementUnit } from '~/stores/measurementUnits';
import type { DishCategory } from '~/stores/dishCategories';

const props = defineProps<{
  initialData?: Dish | null;
  measurementUnits: MeasurementUnit[];
  categories: DishCategory[];
  isSubmitting?: boolean;
}>();
const emit = defineEmits(['submit']);

const { locale } = useI18n();
const localePath = useLocalePath();

const formData = ref<DishPayload>({
  name_kz: '',
  name_ru: '',
  name_en: '',
  category: null,
  barcode: '',
  measurement_unit: null,
});
const logoPreview = ref<string | null>(null);

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value.name_kz = newData.name_kz;
    formData.value.name_ru = newData.name_ru;
    formData.value.name_en = newData.name_en;
    formData.value.category = newData.category;
    formData.value.measurement_unit = newData.measurement_unit;
    formData.value.barcode = newData.barcode;
    logoPreview.value = newData.logo;
  }
}, { immediate: true });

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    formData.value.logo = file;
    logoPreview.value = URL.createObjectURL(file);
  }
}

function submitForm() {
  emit('submit', formData.value);
}
</script>
