<template>
  <header class="flex items-center justify-between px-6 py-2 bg-white border-b-2 border-gray-200">
    <div class="flex items-center">
      <button @click="uiStore.toggleSidebar()" class="text-gray-500 focus:outline-none lg:hidden">
        <Menu class="w-6 h-6" />
      </button>
      <button @click="uiStore.toggleSidebar()" class="text-gray-500 focus:outline-none hidden lg:block">
        <PanelLeftClose v-if="uiStore.isSidebarOpen" class="w-6 h-6" />
        <PanelRightClose v-else class="w-6 h-6" />
      </button>
    </div>

    <div class="flex items-center space-x-4">
      <span class="text-sm font-semibold text-gray-700">{{ authStore.canteenName }}</span>
      <span class="text-sm font-medium text-gray-600">{{ authStore.getUserName }}</span>

      <div class="relative">
        <select v-model="locale" class="p-1 border rounded-md text-sm">
          <option value="kz">🇰🇿 KZ</option>
          <option value="ru">🇷🇺 RU</option>
        </select>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Menu, PanelLeftClose, PanelRightClose } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth';
import { useUiStore } from '~/stores/ui';

const authStore = useAuthStore();
const uiStore = useUiStore();
const { locale } = useI18n();
</script>