<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <div>
      <label for="name_kz" class="block text-sm font-medium text-gray-700">{{ $t('name_kz') }}</label>
      <input type="text" v-model="formData.name_kz" id="name_kz" required
             class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>
    
    <div>
      <label for="name_ru" class="block text-sm font-medium text-gray-700">{{ $t('name_ru') }}</label>
      <input type="text" v-model="formData.name_ru" id="name_ru" required
             class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>
    
    <div>
      <label for="name_en" class="block text-sm font-medium text-gray-700">{{ $t('name_en') }}</label>
      <input type="text" v-model="formData.name_en" id="name_en" required
             class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>

    <div class="flex justify-end space-x-4">
       <NuxtLink :to="localePath('/measurement-units')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
         {{ $t('actions.cancel') }}
      </NuxtLink>
      <button type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        {{ $t('actions.save') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import type { MeasurementUnitPayload, MeasurementUnit } from '~/stores/measurementUnits';

// Определяем props компонента
const props = defineProps<{
  measurementUnit?: MeasurementUnit | null;
}>();

// Определяем событие, которое компонент может генерировать
const emit = defineEmits(['submit']);
const localePath = useLocalePath();

// Реактивная переменная для данных формы
const formData = ref<MeasurementUnitPayload>({
  name_kz: '',
  name_ru: '',
  name_en: '',
});

// Наблюдаем за изменением props.measurementUnit и обновляем formData
// Это необходимо для страницы редактирования, чтобы форма заполнилась текущими данными
watchEffect(() => {
  if (props.measurementUnit) {
    formData.value.name_kz = props.measurementUnit.name_kz;
    formData.value.name_ru = props.measurementUnit.name_ru;
    formData.value.name_en = props.measurementUnit.name_en;
  }
});

// Функция отправки формы
const submitForm = () => {
  // Генерируем событие 'submit' и передаем данные формы
  emit('submit', formData.value);
};
</script>