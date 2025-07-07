<template>
  <!-- Обертка для уведомления и основного макета -->
  <div>
    <!-- 1. Размещаем компонент уведомлений здесь -->
    <TheNotification />

    <div class="relative min-h-screen lg:flex">
      <div v-if="uiStore.isSidebarOpen" @click="uiStore.isSidebarOpen = false"
        class="fixed inset-0 z-20 bg-black opacity-50 transition-opacity lg:hidden"></div>

      <TheSidebar />

      <div class="flex-1 flex flex-col overflow-hidden">
        <TheHeader />

        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div class="container mx-auto px-4 py-4">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui';
// 2. Импортируем новый компонент
import TheNotification from '~/components/TheNotification.vue';

const uiStore = useUiStore();
</script>