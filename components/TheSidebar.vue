<template>
  <div :class="[
      'fixed inset-y-0 left-0 z-30 flex-shrink-0 bg-gray-800 text-white transition-all duration-300',
      'lg:static lg:z-auto',
      uiStore.isSidebarOpen
        ? 'w-64'
        : '-translate-x-full w-64 lg:translate-x-0 lg:w-20'
    ]">
    <div class="flex items-center justify-between h-16 px-4 border-b border-gray-700">
      <h1 v-if="uiStore.isSidebarOpen" class="text-xl font-bold">{{ $t('canteen_name') }}</h1>
      <CookingPot v-else class="w-8 h-8 mx-auto" />
    </div>
    <nav class="mt-4">
      <NuxtLink 
        :to="localePath('/')" 
        @click="handleLinkClick" 
        class="flex items-center px-6 py-3 hover:bg-gray-700"
        :class="[String($route.name).startsWith('index') && 'bg-gray-600']"
      >
        <Home class="w-6 h-6" />
        <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('main_page') }}</span>
      </NuxtLink>

      <div>
        <button @click="isDirectoriesOpen = !isDirectoriesOpen" class="w-full flex items-center justify-between px-6 py-3 mt-2 hover:bg-gray-700">
          <div class="flex items-center">
            <FolderKanban class="w-6 h-6" />
            <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('refs.refs_name') }}</span>
          </div>
          <ChevronDown v-if="uiStore.isSidebarOpen" :class="['w-5 h-5 transition-transform', isDirectoriesOpen ? 'rotate-180' : '']" />
        </button>
        <div v-if="isDirectoriesOpen && uiStore.isSidebarOpen" class="bg-gray-900 py-2">
           <NuxtLink 
            :to="localePath('/contractors')" 
            @click="handleLinkClick" 
            class="flex items-center py-2 pl-12 pr-6 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
            :class="[String($route.name).startsWith('contractors') && 'bg-gray-600 !text-white']"
          >
            <BookOpenText class="w-5 h-5" />
            <span class="mx-4">{{ $t('contractors') }}</span>
          </NuxtLink>
        </div>
        <div v-if="isDirectoriesOpen && uiStore.isSidebarOpen" class="bg-gray-900 py-2">
           <NuxtLink 
            :to="localePath('/measurement-units')" 
            @click="handleLinkClick" 
            class="flex items-center py-2 pl-12 pr-6 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
            :class="[String($route.name).startsWith('refs') && 'bg-gray-600 !text-white']"
          >
            <BookOpenText class="w-5 h-5" />
            <span class="mx-4">{{ $t('refs.measurement_units') }}</span>
          </NuxtLink>
        </div>
      </div>
      
      <NuxtLink 
        :to="localePath('/reports')" 
        @click="handleLinkClick" 
        class="flex items-center px-6 py-3 mt-2 hover:bg-gray-700"
        :class="[String($route.name).startsWith('reports') && 'bg-gray-600']"
      >
        <BarChart3 class="w-6 h-6" />
        <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('reports') }}</span>
      </NuxtLink>
      
      <a @click.prevent="authStore.logout()" href="#" class="flex items-center px-6 py-3 mt-8 hover:bg-red-700 cursor-pointer">
        <LogOut class="w-6 h-6" />
        <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('logout') }}</span>
      </a>
    </nav>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Home, BookOpenText, BarChart3, LogOut, CookingPot, FolderKanban, ChevronDown } from 'lucide-vue-next';
import { useUiStore } from '~/stores/ui';
import { useAuthStore } from '~/stores/auth';

const route = useRoute(); // <-- Получаем доступ к текущему маршруту
const { t } = useI18n();
const localePath = useLocalePath();
const uiStore = useUiStore();
const authStore = useAuthStore();

const isDirectoriesOpen = ref(
  // Проверяем имя маршрута при первоначальной загрузке
  String(route.name).startsWith('contractors')
);

// Следим за изменением имени маршрута при навигации
watch(() => route.name, (newName) => {
  if (String(newName).startsWith('contractors')) {
    isDirectoriesOpen.value = true;
  }
});

function handleLinkClick() {
  if (window.innerWidth < 1024) {
    uiStore.isSidebarOpen = false;
  }
}
</script>