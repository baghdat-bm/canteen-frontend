import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
    // По умолчанию сайдбар открыт (для десктопа)
    const isSidebarOpen = ref(true);

    function toggleSidebar() {
        isSidebarOpen.value = !isSidebarOpen.value;
    }

    return { isSidebarOpen, toggleSidebar };
}, 
{
    // --- ↓↓↓ ВСЁ ВОЛШЕБСТВО ЗДЕСЬ ↓↓↓ ---
    // Эта опция говорит плагину pinia-plugin-persistedstate,
    // чтобы он сохранял состояние этого хранилища в localStorage.
    persist: true, 
});