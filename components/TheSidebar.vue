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
        <!-- Кнопка для раскрытия меню в развернутом состоянии -->
        <button v-if="uiStore.isSidebarOpen" @click="isDirectoriesOpen = !isDirectoriesOpen" class="w-full flex items-center justify-between px-6 py-3 mt-2 hover:bg-gray-700">
          <div class="flex items-center">
            <FolderKanban class="w-6 h-6" />
            <span class="mx-4">{{ $t('refs.refs_name') }}</span>
          </div>
          <ChevronDown :class="['w-5 h-5 transition-transform', isDirectoriesOpen ? 'rotate-180' : '']" />
        </button>
        
        <!-- Просто иконка в свернутом состоянии -->
        <div v-else class="flex items-center px-6 py-3 mt-2 text-gray-400">
            <FolderKanban class="w-6 h-6" />
        </div>

        <!-- Выпадающее меню для развернутого состояния -->
        <div v-if="isDirectoriesOpen && uiStore.isSidebarOpen" class="bg-gray-900 py-1 transition-all duration-300">
            <NuxtLink 
              v-for="link in directoryLinks"
              :key="link.name"
              :to="localePath(link.path)" 
              @click="handleLinkClick" 
              class="flex items-center py-2 pl-12 pr-6 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
              :class="[String($route.name).startsWith(link.name) && 'bg-gray-600 !text-white']"
            >
              <component :is="link.icon" class="w-5 h-5" />
              <span class="mx-4">{{ $t(link.labelKey) }}</span>
            </NuxtLink>
        </div>
        
        <!-- Иконки для свернутого состояния -->
        <div v-if="!uiStore.isSidebarOpen" class="space-y-1">
          <NuxtLink
            v-for="link in directoryLinks"
            :key="`icon-${link.name}`"
            :to="localePath(link.path)"
            @click="handleLinkClick"
            class="flex items-center justify-center py-3 hover:bg-gray-700"
            :class="[String($route.name).startsWith(link.name) && 'bg-gray-600']"
            :title="$t(link.labelKey)"
          >
            <component :is="link.icon" class="w-6 h-6" />
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
      
      <a @click.prevent="confirmLogout" href="#" class="flex items-center px-6 py-3 mt-8 hover:bg-red-700 cursor-pointer">
        <LogOut class="w-6 h-6" />
        <span v-if="uiStore.isSidebarOpen" class="mx-4">{{ $t('logout') }}</span>
      </a>
    </nav>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { 
  Home, BarChart3, LogOut, CookingPot, FolderKanban, ChevronDown, 
  Building2, Ruler, BookMinus, UtensilsCrossed
} from 'lucide-vue-next';
import { useUiStore } from '~/stores/ui';
import { useAuthStore } from '~/stores/auth';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

// --- Подключение composables ---
const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const uiStore = useUiStore();
const authStore = useAuthStore();

// --- Ссылки для подменю "Справочники" с указанием иконок ---
const directoryLinks = ref([
  { name: 'contractors', path: '/contractors', labelKey: 'contractors', icon: Building2 },
  { name: 'measurement-units', path: '/measurement-units', labelKey: 'refs.measurement_units', icon: Ruler },
  { name: 'writing-off-reasons', path: '/writing-off-reasons', labelKey: 'refs.writingOffReasons', icon: BookMinus },
  { name: 'dishes-categories', path: '/dishes-categories', labelKey: 'dishCategory.itemList', icon: UtensilsCrossed }
]);

const directoryRoutes = directoryLinks.value.map(l => l.name);

// --- Состояние для выпадающего меню ---
const isDirectoriesOpen = ref(
  directoryRoutes.some(dir => String(route.name).startsWith(dir))
);

// Следим за изменением маршрута, чтобы подменю оставалось открытым
watch(() => route.name, (newName) => {
  if (directoryRoutes.some(dir => String(newName).startsWith(dir))) {
    isDirectoriesOpen.value = true;
  }
});

// --- Функции ---

/**
 * Скрывает сайдбар на мобильных устройствах после клика по ссылке
 */
function handleLinkClick() {
  if (window.innerWidth < 1024) {
    uiStore.isSidebarOpen = false;
  }
}

/**
 * Запрашивает подтверждение и выполняет выход из системы
 */
function confirmLogout() {
  if (window.confirm(t('message.confirmLogout'))) {
    authStore.logout();
  }
}
</script>
