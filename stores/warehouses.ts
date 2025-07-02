import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '~/utils/apiClient';
import { useUiStore } from './ui.js'; 

// Определяем интерфейс для объекта записи
export interface Warehouse {
    id: number;
    name: string;    
    school: number;
}

// Определяем интерфейс для данных, отправляемых при создании (без id)
export type WarehousePayload = Omit<Warehouse, 'id'>;


export const useWarehouseStore = defineStore('warehouses', () => {
    // --- State ---
    // Список всех записей
    const warehouses = ref<Warehouse[]>([]);
    // Одна выбранная запись
    const warehouse = ref<Warehouse | null>(null);
    // Время последнего запроса для кэширования
    const lastFetched = ref<Date | null>(null);
    // Состояние загрузки
    const isLoading = ref(false);

    // --- Getters ---
    // Проверяет, нужно ли загружать данные с сервера (кэш 15 минут)
    const shouldFetch = computed(() => {
        if (!lastFetched.value) {
            return true;
        }
        const fifteenMinutes = 15 * 60 * 1000;
        return (new Date().getTime() - lastFetched.value.getTime()) > fifteenMinutes;
    });

    // --- Actions ---
    
    /**
     * Получение списка всех записей с сервера
     * @param {boolean} force - Принудительно обновить данные, игнорируя кэш
     */
    async function fetchRecords(force = false) {
        const uiStore = useUiStore(); 
        if (!shouldFetch.value && !force) {
            return;
        }

        isLoading.value = true;
        try {
            const response = await apiClient<Warehouse[]>('/warehouses/');
            warehouses.value = response;
            lastFetched.value = new Date();
        } catch (error) {            
            const errText = 'Failed to fetch warehouses';
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
            console.error(errText, error);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Получение одной записей по ID
     * @param {number} id - ID записи
     */
    async function fetchRecord(id: number) {
        const uiStore = useUiStore(); 
        isLoading.value = true;
        try {
            const response = await apiClient<Warehouse>(`/warehouses/${id}/`);
            warehouse.value = response;
        } catch (error) {
            const errText = `Failed to fetch warehouse with id ${id}`;
            console.error(errText, error);
            warehouse.value = null;
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Создание новой записи
     * @param {WarehousePayload} payload - Данные для создания
     */
    async function createRecord(payload: WarehousePayload) {
        const uiStore = useUiStore(); 
        try {
            await apiClient('/warehouses/', {
                method: 'POST',
                body: payload,
            });
            // Инвалидация кэша после создания
            lastFetched.value = null;
        } catch (error) {
            const errText = 'Failed to create warehouse';
            console.error(errText, error);            
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }

    /**
     * Обновление существующей записи
     * @param {number} id - ID записи
     * @param {WarehousePayload} payload - Данные для обновления
     */
    async function updateRecord(id: number, payload: WarehousePayload) {
        const uiStore = useUiStore(); 
        try {
            await apiClient(`/warehouses/${id}/`, {
                method: 'PUT',
                body: payload,
            });
            // Инвалидация кэша
            lastFetched.value = null;
        } catch (error) {
            const errText = `Failed to update warehouse with id ${id}`;
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }
    
    /**
     * Удаление записи
     * @param {number} id - ID записи
     */
    async function deleteRecord(id: number) {

        const uiStore = useUiStore();        
        const nuxtApp = useNuxtApp();        
        const { t } = nuxtApp.$i18n;

        try {
            await apiClient(`/warehouses/${id}/`, {
                method: 'DELETE',
            });
            // Инвалидация кэша и обновление списка
            lastFetched.value = null;
            await fetchRecords(true); // Принудительное обновление

            uiStore.showNotification({
                message: t('warehouse.itemDeleted'),
                type: 'success',
            });
        } catch (error) {
            console.error(`Failed to delete warehouse with id ${id}:`, error);

            uiStore.showNotification({
                message: t('warehouse.errorOnDelete'),
                type: 'error',
                duration: 7000
            });
        }
    }

    return {
        warehouses,
        warehouse,
        isLoading,
        lastFetched,
        shouldFetch,
        fetchRecords,
        fetchRecord,
        createRecord,
        updateRecord,
        deleteRecord,
    };
});
