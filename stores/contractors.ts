import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '~/utils/apiClient'
import { useUiStore } from './ui.js'; 

// Определяем интерфейс для нашего контрагента
export interface Contractor {
    id: number;
    name: string;
    bik: string;
    bank: string;
    corr_account: string;
    check_account: string;
}

export const useContractorsStore = defineStore('contractors', () => {
    // --- State ---
    // Список всех контрагентов
    const contractors = ref<Contractor[]>([]);
    // Время последнего запроса для кэширования
    const lastFetched = ref<Date | null>(null);
    // Состояние загрузки
    const isLoading = ref(false);

    // --- Getters ---
    // Геттер для получения одного контрагента по ID из списка
    const getContractorById = computed(() => {
        return (id: number) => contractors.value.find(c => c.id === id);
    });

    // --- Actions ---

    function reset() {
        contractors.value = [];        
        lastFetched.value = null;
        isLoading.value = false;
    }

    /**
     * Получает список контрагентов с кэшированием на 15 минут
     */
    async function fetchContractors() {
        const uiStore = useUiStore(); 
        const CACHE_DURATION = 15 * 60 * 1000; // 15 минут в миллисекундах

        // Если данные уже загружены и кэш не протух, ничего не делаем
        if (lastFetched.value && (new Date().getTime() - lastFetched.value.getTime() < CACHE_DURATION)) {
            console.log('Загрузка контрагентов из кэша Pinia.');
            return;
        }

        console.log('Кэш устарел, загрузка контрагентов с сервера...');
        isLoading.value = true;
        try {
            const data = await apiClient<Contractor[]>('/contractors/');
            contractors.value = data;
            lastFetched.value = new Date(); // Обновляем время последнего запроса
        } catch (error) {            
            const errText = "Ошибка при загрузке контрагентов";
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        } finally {
            // setTimeout(()=>{
            //     isLoading.value = false;
            // }, 30000);
            isLoading.value = false;
        }
    }

    /**
     * Создает нового контрагента
     */
    async function createContractor(data: Omit<Contractor, 'id'>) {
        const uiStore = useUiStore(); 
        try {
            const newContractor = await apiClient<Contractor>('/contractors/', {
                method: 'POST',
                body: data,
            });
            // Добавляем нового контрагента в начало списка для мгновенного отклика
            contractors.value.unshift(newContractor);
            // или можно сбросить кэш и перезапросить весь список:
            // lastFetched.value = null;
            // await fetchContractors();
        } catch (error) {            
            const errText = "Ошибка при создании контрагента";
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }

    /**
     * Обновляет существующего контрагента
     */
    async function updateContractor(id: number, data: Partial<Omit<Contractor, 'id'>>) {
        const uiStore = useUiStore(); 
        try {
            const updatedContractor = await apiClient<Contractor>(`/contractors/${id}/`, {
                method: 'PATCH',
                body: data,
            });
            // Находим и обновляем контрагента в нашем локальном списке
            const index = contractors.value.findIndex(c => c.id === id);
            if (index !== -1) {
                contractors.value[index] = updatedContractor;
            }
        } catch (error) {            
            const errText = `Ошибка при обновлении контрагента ${id}`;
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }

    /**
     * Удаляет контрагента
     */
    async function deleteContractor(id: number) {

        const uiStore = useUiStore();        
        const nuxtApp = useNuxtApp();        
        const { t } = nuxtApp.$i18n;

        try {
            await apiClient(`/contractors/${id}/`, {
                method: 'DELETE',
            });
            // Удаляем контрагента из локального списка для мгновенного отклика
            contractors.value = contractors.value.filter(c => c.id !== id);
            uiStore.showNotification({
                message: t('contractor.itemDeleted'),
                type: 'success',
            });
        } catch (error) {
            console.error(`Ошибка при удалении контрагента ${id}:`, error);
            uiStore.showNotification({
                message: t('contractor.errorOnDelete'),
                type: 'error',
                duration: 7000
            });
        }
    }

    return {
        contractors,
        isLoading,
        getContractorById,
        fetchContractors,
        createContractor,
        updateContractor,
        deleteContractor,
        reset,
    };
});