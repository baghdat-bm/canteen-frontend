<template>
  <div :class="['flex-shrink-0 bg-gray-800 text-white transition-all duration-300', uiStore.isSidebarOpen ? 'w-64' : 'w-20']">
    <div class="flex items-center justify-center h-16 border-b border-gray-700">
      <h1 v-if="uiStore.isSidebarOpen" class="text-xl font-bold">АСХАНА</h1>
      <CookingPot v-else class="w-8 h-8" />
    </div>
    <nav class="mt-4">
      <a href="#" class="flex items-center px-6 py-3 hover:bg-gray-700">
        <Home class="w-6 h-6" />
        <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('main_page') }}</span>
      </a>
      <a href="#" class="flex items-center px-6 py-3 mt-2 hover:bg-gray-700">
        <BookOpenText class="w-6 h-6" />
        <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('menu') }}</span>
      </a>
      <a href="#" class="flex items-center px-6 py-3 mt-2 hover:bg-gray-700">
        <BarChart3 class="w-6 h-6" />
        <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('reports') }}</span>
      </a>
      <a @click.prevent="authStore.logout()" href="#" class="flex items-center px-6 py-3 mt-8 hover:bg-red-700">
        <LogOut class="w-6 h-6" />
        <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('logout') }}</span>
      </a>
    </nav>
  </div>
</template>

<script setup>
import { Home, BookOpenText, BarChart3, LogOut, CookingPot } from 'lucide-vue-next';
import { useUiStore } from '~/stores/ui';
import { useAuthStore } from '~/stores/auth';

const uiStore = useUiStore();
const authStore = useAuthStore();
const { t } = useI18n();
</script>