import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {apiClient, type PaginatedResponse} from '~/utils/apiClient';
import { useUiStore } from './ui.js';

import { useAuthStore } from './auth';
import { useNuxtApp } from '#app';

// Определяем интерфейс для объекта записи
export interface Warehouse {
    id: number;
    name: string;
    description: string;
    school: number;
}

// Теперь при создании/обновлении нужно будет передавать только `name` и `description`.
export type WarehousePayload = Omit<Warehouse, 'id' | 'school'>;


export const useWarehouseStore = defineStore('warehouses', () => {
    // --- State ---
    const warehouses = ref<Warehouse[]>([]);
    const warehouse = ref<Warehouse | null>(null);
    const isLoading = ref(false);

    // --- Состояние для пагинации ---
    const totalRecords = ref(0);
    const pageSize = ref(30); // 30 записей на страницу
    const currentPage = ref(1);

    // --- Getters ---
    const totalPages = computed(() => {
        if (totalRecords.value === 0) return 1;
        return Math.ceil(totalRecords.value / pageSize.value);
    });

    // --- Actions ---

    function reset() {
        warehouses.value = [];
        warehouse.value = null;
        isLoading.value = false;
        totalRecords.value = 0;
        currentPage.value = 1;
    }

    /**
     * Получение списка всех записей с сервера
     * @param {number} page - Номер страницы для загрузки
     */
    async function fetchRecords(page: number = 1) {
        const uiStore = useUiStore();
        isLoading.value = true;
        currentPage.value = page;

        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('page_size', pageSize.value.toString());

            const urlStr = `/warehouses/?${params.toString()}`;
            const response = await apiClient<PaginatedResponse<Warehouse>>(urlStr);
            warehouses.value = response.results;
            totalRecords.value = response.count;

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

            warehouses.value = warehouses.value.filter(c => c.id !== id);
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


    return {
        warehouses,
        warehouse,
        isLoading,
        totalRecords,
        currentPage,
        pageSize,
        totalPages,
        fetchRecords,
        fetchRecord,
        createRecord,
        updateRecord,
        deleteRecord,
        reset,
    };
});
