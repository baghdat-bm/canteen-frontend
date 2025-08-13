<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    leave-active-class="transition-all duration-300 ease-in"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      @click.self="handleCancel"
      class="fixed inset-0 bg-gray-700 bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    >
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        leave-active-class="transition-all duration-300 ease-in"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="modelValue" class="p-5 border w-120 shadow-lg rounded-md bg-white">
          <div class="text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">{{ title }}</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">{{ message }}</p>
            </div>
            <div class="items-center px-4 py-3">
              <button
                @click="handleConfirm"
                class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                {{ confirmButtonText }}
              </button>
              <button
                @click="handleCancel"
                class="ml-3 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {{ cancelButtonText ? cancelButtonText : $t('actions.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n';

// Определяем props с помощью withDefaults для значений по умолчанию
interface Props {
  modelValue: boolean; // Для использования с v-model
  title?: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Подтвердите действие',
  confirmButtonText: 'Подтвердить',
  cancelButtonText: '',
});

// Определяем события, которые компонент может отправлять родителю
const emit = defineEmits(['update:modelValue', 'confirm']);

const { t } = useI18n();

// Функция для подтверждения
function handleConfirm() {
  emit('confirm');
  emit('update:modelValue', false); // Закрываем окно после подтверждения
}

// Функция для отмены
function handleCancel() {
  emit('update:modelValue', false); // Закрываем окно
}
</script>