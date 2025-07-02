<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <div>
      <label for="name_kz" class="block text-sm font-medium text-gray-700">{{ $t('name') }}</label>
      <input type="text" v-model="formData.name" id="name" required
             class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>
    
    <div>
      <label for="name_ru" class="block text-sm font-medium text-gray-700">{{ $t('description') }}</label>
      <input type="text" v-model="formData.description" id="description"
             class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>   

    <div class="flex justify-end space-x-4">
       <NuxtLink :to="localePath('/warehouses')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
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
import type { WarehousePayload, Warehouse } from '~/stores/warehouses';

// Определяем props компонента
const props = defineProps<{
  warehouse?: Warehouse | null;
}>();

// Определяем событие, которое компонент может генерировать
const emit = defineEmits(['submit']);
const localePath = useLocalePath();

// Реактивная переменная для данных формы
const formData = ref<WarehousePayload>({
  name: '',
  description: '',  
});

// Наблюдаем за изменением props.warehouse и обновляем formData
// Это необходимо для страницы редактирования, чтобы форма заполнилась текущими данными
watchEffect(() => {
  if (props.warehouse) {
    formData.value.name = props.warehouse.name;
    formData.value.description = props.warehouse.description;    
  }
});

// Функция отправки формы
const submitForm = () => {
  // Генерируем событие 'submit' и передаем данные формы
  emit('submit', formData.value);
};
</script>