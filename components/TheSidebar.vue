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


      <!-- Документы-->
      <div>
        <!-- Кнопка для раскрытия меню в развернутом состоянии -->
        <button v-if="uiStore.isSidebarOpen" @click="isDocsOpen = !isDocsOpen" class="w-full flex items-center justify-between px-6 py-3 mt-2 hover:bg-gray-700">
          <div class="flex items-center">
            <Files class="w-6 h-6" />
            <span class="mx-4">{{ $t('docs.docs_name') }}</span>
          </div>
          <ChevronDown :class="['w-5 h-5 transition-transform', isDocsOpen ? 'rotate-180' : '']" />
        </button>

        <!-- Просто иконка в свернутом состоянии -->
        <div v-else class="flex items-center px-6 py-3 mt-2 text-gray-400">
          <Files class="w-6 h-6" />
        </div>

        <!-- Выпадающее меню для развернутого состояния -->
        <div v-if="isDocsOpen && uiStore.isSidebarOpen" class="bg-gray-900 py-1 transition-all duration-300">
          <NuxtLink
              v-for="link in docLinks"
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
              v-for="link in docLinks"
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


      <!-- Справочники-->
      <div>
        <!-- Кнопка для раскрытия меню в развернутом состоянии -->
        <button v-if="uiStore.isSidebarOpen" @click="isRefsOpen = !isRefsOpen" class="w-full flex items-center justify-between px-6 py-3 mt-2 hover:bg-gray-700">
          <div class="flex items-center">
            <FolderKanban class="w-6 h-6" />
            <span class="mx-4">{{ $t('refs.refs_name') }}</span>
          </div>
          <ChevronDown :class="['w-5 h-5 transition-transform', isRefsOpen ? 'rotate-180' : '']" />
        </button>
        
        <!-- Просто иконка в свернутом состоянии -->
        <div v-else class="flex items-center px-6 py-3 mt-2 text-gray-400">
            <FolderKanban class="w-6 h-6" />
        </div>

        <!-- Выпадающее меню для развернутого состояния -->
        <div v-if="isRefsOpen && uiStore.isSidebarOpen" class="bg-gray-900 py-1 transition-all duration-300">
            <NuxtLink 
              v-for="link in refLinks"
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
            v-for="link in refLinks"
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

    <!-- Диалоговое окно подтверждения логаута -->
    <div class="p-4">
      <ConfirmDialog v-model="showLogoutModal"
                     :title="$t('captions.confirmLogout')"
                     :message="$t('messages.confirmLogout')"
                     :confirm-button-text="$t('logout')"
                     @confirm="logoutConfirmed"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  Files, FilePlus2,
  Home, BarChart3, LogOut, CookingPot, FolderKanban, ChevronDown, 
  Building2, Ruler, BookMinus, UtensilsCrossed, Warehouse, Salad,
  FileMinus2
} from 'lucide-vue-next';
import { useUiStore } from '~/stores/ui';
import { useAuthStore } from '~/stores/auth';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ConfirmDialog from "~/components/dialogs/ConfirmDialog.vue";

// --- Подключение composables ---
const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const uiStore = useUiStore();
const authStore = useAuthStore();
const showLogoutModal = ref(false);

// --- Ссылки для подменю "Документы" с указанием иконок ---
const docLinks = ref([
  { name: 'incoming-invoices', path: '/incoming-invoices', labelKey: 'incomingInvoice.itemList', icon: FilePlus2 },
  { name: 'write-offs', path: '/write-offs', labelKey: 'writeOff.itemList', icon: FileMinus2 },
]);

const docRoutes = docLinks.value.map(l => l.name);

// --- Состояние для выпадающего меню ---
const isDocsOpen = ref(
    docRoutes.some(dir => String(route.name).startsWith(dir))
);


// --- Ссылки для подменю "Справочники" с указанием иконок ---
const refLinks = ref([
  { name: 'contractors', path: '/contractors', labelKey: 'contractors', icon: Building2 },
  { name: 'measurement-units', path: '/measurement-units', labelKey: 'refs.measurement_units', icon: Ruler },
  { name: 'write-offs-reasons', path: '/writing-off-reasons', labelKey: 'refs.writingOffReasons', icon: BookMinus },
  { name: 'warehouses', path: '/warehouses', labelKey: 'warehouse.itemList', icon: Warehouse },
  { name: 'dishes-categories', path: '/dishes-categories', labelKey: 'dishCategory.itemList', icon: UtensilsCrossed },
  { name: 'the-dishes', path: '/the-dishes', labelKey: 'dish.itemList', icon: Salad },
]);

const refRoutes = refLinks.value.map(l => l.name);

// --- Состояние для выпадающего меню ---
const isRefsOpen = ref(
  refRoutes.some(dir => String(route.name).startsWith(dir))
);

// Следим за изменением маршрута, чтобы подменю оставалось открытым
watch(() => route.name, (newName) => {
  if (docRoutes.some(dir => String(newName).startsWith(dir))) {
    isDocsOpen.value = true;
  }

  if (refRoutes.some(dir => String(newName).startsWith(dir))) {
    isRefsOpen.value = true;
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


function confirmLogout() {
  showLogoutModal.value = true;
}

const logoutConfirmed = async () => {
  authStore.logout();
};

</script>
