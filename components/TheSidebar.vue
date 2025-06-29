<template>
  <nav class="mt-4">
    <NuxtLink :to="localePath('/')" class="flex items-center px-6 py-3 hover:bg-gray-700">
      <Home class="w-6 h-6" />
      <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('main_page') }}</span>
    </NuxtLink>

    <NuxtLink :to="localePath('/contractors')" class="flex items-center px-6 py-3 mt-2 hover:bg-gray-700">
      <BookOpenText class="w-6 h-6" />
      <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('contractors') }}</span>
    </NuxtLink>
    
    <NuxtLink :to="localePath('/reports')" class="flex items-center px-6 py-3 mt-2 hover:bg-gray-700">
      <BarChart3 class="w-6 h-6" />
      <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('reports') }}</span>
    </NuxtLink>
    
    <a @click.prevent="authStore.logout()" href="#" class="flex items-center px-6 py-3 mt-8 hover:bg-red-700 cursor-pointer">
      <LogOut class="w-6 h-6" />
      <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('logout') }}</span>
    </a>
  </nav>
  </template>

<script setup>
import { Home, BookOpenText, BarChart3, LogOut, CookingPot } from 'lucide-vue-next';
import { useUiStore } from '~/stores/ui';
import { useAuthStore } from '~/stores/auth';

const { t } = useI18n();
// А `localePath` - это результат вызова отдельного композибла useLocalePath()
const localePath = useLocalePath();
const uiStore = useUiStore();
const authStore = useAuthStore();
</script>