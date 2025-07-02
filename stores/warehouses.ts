import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '~/utils/apiClient';
import { useUiStore } from './ui.js'; 
// 1. Импортируем хранилище аутентификации
import { useAuthStore } from './auth';
import { useNuxtApp } from '#app';

// Определяем интерфейс для объекта записи
export interface Warehouse {
    id: number;
    name: string;
    description: string;
    school: number;
}

// 2. Изменяем Payload, чтобы он не требовал 'school' при вызове
// Теперь при создании/обновлении нужно будет передавать только `name` и `description`.
export type WarehousePayload = Omit<Warehouse, 'id' | 'school'>;


export const useWarehouseStore = defineStore('warehouses', () => {
    // --- State ---
    const warehouses = ref<Warehouse[]>([]);
    const warehouse = ref<Warehouse | null>(null);
    const lastFetched = ref<Date | null>(null);
    const isLoading = ref(false);

    // --- Getters ---
    const shouldFetch = computed(() => {
        if (!lastFetched.value) {
            return true;
        }
        const fifteenMinutes = 15 * 60 * 1000;
        return (new Date().getTime() - lastFetched.value.getTime()) > fifteenMinutes;
    });

    // --- Actions ---
    
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
                message: errText, // Здесь тоже хорошо бы использовать t()
                type: 'error',
                duration: 7000
            });
            console.error(errText, error);
        } finally {
            isLoading.value = false;
        }
    }

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
                message: errText, // И здесь
                type: 'error',
                duration: 7000
            });
        } finally {
            isLoading.value = false;
        }
    }

    async function createRecord(payload: WarehousePayload) {
        const uiStore = useUiStore(); 
        // 3. Получаем доступ к хранилищу auth
        const authStore = useAuthStore();
        const { t } = useNuxtApp().$i18n;

        // 4. Проверяем, есть ли у нас ID школы
        if (!authStore.userProfile?.school_id) {
            uiStore.showNotification({ message: t('warehouse.noSchoolIdError'), type: 'error' });
            console.error("Cannot create record: school_id is missing from user profile.");
            return;
        }

        try {
            // 5. Создаем полный объект для отправки, добавляя school_id
            const fullPayload = {
                ...payload,
                school: authStore.userProfile.school_id
            };

            await apiClient('/warehouses/', {
                method: 'POST',
                body: fullPayload,
            });
            lastFetched.value = null; // Инвалидация кэша            
        } catch (error) {
            console.error('Failed to create warehouse:', error);           
            uiStore.showNotification({ message: 'Failed to create warehouse', type: 'error' });
        }
    }

    async function updateRecord(id: number, payload: WarehousePayload) {
        const uiStore = useUiStore(); 
        // Повторяем ту же логику для обновления
        const authStore = useAuthStore();
        const { t } = useNuxtApp().$i18n;

        if (!authStore.userProfile?.school_id) {
            uiStore.showNotification({ message: t('warehouse.noSchoolIdError'), type: 'error' });
            console.error("Cannot update record: school_id is missing from user profile.");
            return;
        }

        try {
            const fullPayload = {
                ...payload,
                school: authStore.userProfile.school_id
            };

            await apiClient(`/warehouses/${id}/`, {
                method: 'PUT',
                body: fullPayload,
            });
            lastFetched.value = null; // Инвалидация кэша            
        } catch (error) {
            const errText = `Failed to update warehouse with id ${id}`;
            console.error(errText, error);
            uiStore.showNotification({ message: errText, type: 'error' });
        }
    }
    
    async function deleteRecord(id: number) {
        const uiStore = useUiStore();         
        const { t } = useNuxtApp().$i18n;

        try {
            await apiClient(`/warehouses/${id}/`, {
                method: 'DELETE',
            });
            lastFetched.value = null;
            await fetchRecords(true); // Принудительное обновление
            uiStore.showNotification({
                message: t('warehouse.itemDeleted'),
                type: 'success'
            });
        } catch (error) {
            const errText = t('warehouse.errorOnDelete');
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }

    function reset() {
        warehouses.value = [];
        warehouse.value = null;
        lastFetched.value = null;
        isLoading.value = false;
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
        reset,
    };
});
