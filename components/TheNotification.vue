<template>
  <!-- Контейнер для позиционирования -->
  <div class="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 pointer-events-none">
    <!-- Компонент Transition для анимации появления/исчезания -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 -translate-y-10"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-10"
    >
      <!-- Само уведомление, показывается по условию -->
      <div
        v-if="uiStore.notification.show"
        :class="notificationClasses"
        class="flex items-center justify-between max-w-sm p-4 text-white rounded-lg shadow-lg pointer-events-auto sm:max-w-md md:max-w-lg"
        role="alert"
      >
        <div class="flex items-center">
          <!-- Иконка в зависимости от типа -->
          <component :is="iconComponent" class="w-6 h-6 mr-3 flex-shrink-0" />
          <!-- Текст сообщения -->
          <span class="text-sm font-medium">{{ uiStore.notification.message }}</span>
        </div>
        <!-- Кнопка закрытия -->
        <button @click="uiStore.hideNotification()" class="p-1 -mr-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">
          <X class="w-5 h-5" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUiStore } from '~/stores/ui.js';
import { X, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-vue-next';

const uiStore = useUiStore();

// Вычисляемое свойство для определения CSS-классов в зависимости от типа уведомления
const notificationClasses = computed(() => {
  const type = uiStore.notification.type;
  switch (type) {
    case 'success':
      return 'bg-green-500'; // Зеленый
    case 'warning':
      return 'bg-orange-500'; // Оранжевый
    case 'error':
      return 'bg-red-600'; // Красный
    case 'info':
    default:
      return 'bg-blue-500'; // Синий (по умолчанию)
  }
});

// Вычисляемое свойство для выбора иконки
const iconComponent = computed(() => {
    const type = uiStore.notification.type;
    switch (type) {
        case 'success': return CheckCircle2;
        case 'warning': return AlertTriangle;
        case 'error': return XCircle;
        case 'info':
        default: return Info;
    }
});
</script>
