import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '~/utils/apiClient';
import { useUiStore } from './ui.js'; 

// Интерфейс для объекта категории блюд
export interface DishCategory {
    id: number;
    name_kz: string;
    name_ru: string;
    name_en: string;
    logo: string | null;
    color: string;
    measurement_unit: number;
}

// Тип для данных, отправляемых на сервер (без id)
// `logo` может быть File или null (если не меняется)
export interface DishCategoryPayload {
    name_kz: string;
    name_ru: string;
    name_en: string;
    logo?: File | null;
    color: string;
    measurement_unit: number | null;
}

export const useDishCategoriesStore = defineStore('dishCategories', () => {
    // --- State ---
    const dishCategories = ref<DishCategory[]>([]);
    const dishCategory = ref<DishCategory | null>(null);
    const lastFetched = ref<Date | null>(null);
    const isLoading = ref(false);

    // --- Getters ---
    const shouldFetch = computed(() => {
        if (!lastFetched.value) return true;
        const fifteenMinutes = 15 * 60 * 1000;
        return (new Date().getTime() - lastFetched.value.getTime()) > fifteenMinutes;
    });

    // --- Actions ---
    
    async function fetchRecords(force = false) {
        const uiStore = useUiStore(); 
        if (!shouldFetch.value && !force) return;
        isLoading.value = true;
        try {
            const response = await apiClient<DishCategory[]>('/dishes-categories/');
            dishCategories.value = response;
            lastFetched.value = new Date();
        } catch (error) {            
            const errText = 'Failed to fetch dish categories';
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

    async function fetchRecord(id: number) {
        const uiStore = useUiStore(); 
        isLoading.value = true;
        try {
            const response = await apiClient<DishCategory>(`/dishes-categories/${id}/`);
            dishCategory.value = response;
        } catch (error) {            
            dishCategory.value = null;
            const errText = `Failed to fetch dish category with id ${id}`;
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
     * Преобразует объект payload в FormData для отправки файлов
     */
    function createFormData(payload: DishCategoryPayload): FormData {
        const formData = new FormData();
        formData.append('name_kz', payload.name_kz);
        formData.append('name_ru', payload.name_ru);
        formData.append('name_en', payload.name_en);
        formData.append('color', payload.color);
        if (payload.measurement_unit) {
            formData.append('measurement_unit', String(payload.measurement_unit));
        }
        // Добавляем файл, только если он был выбран
        if (payload.logo instanceof File) {
            formData.append('logo', payload.logo);
        }
        return formData;
    }

    async function createRecord(payload: DishCategoryPayload) {
        const uiStore = useUiStore(); 
        const formData = createFormData(payload);
        try {
            await apiClient('/dishes-categories/', {
                method: 'POST',
                body: formData,
            });
            lastFetched.value = null;
        } catch (error) {            
            const errText = 'Failed to create dish category';
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
            console.error(errText, error); 
        }
    }

    async function updateRecord(id: number, payload: DishCategoryPayload) {
        const uiStore = useUiStore(); 
        const formData = createFormData(payload);
        try {
            // Используем PATCH, чтобы можно было не отправлять файл, если он не менялся
            await apiClient(`/dishes-categories/${id}/`, {
                method: 'PATCH', 
                body: formData,
            });
            lastFetched.value = null;
        } catch (error) {            
            const errText = `Failed to update dish category with id ${id}`;
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
            console.error(errText, error); 
        }
    }
    
    async function deleteRecord(id: number) {
        
        const uiStore = useUiStore();        
        const nuxtApp = useNuxtApp();        
        const { t } = nuxtApp.$i18n;

        try {
            await apiClient(`/dishes-categories/${id}/`, {
                method: 'DELETE',
            });
            lastFetched.value = null;
            await fetchRecords(true);

            uiStore.showNotification({
                message: t('dishCategory.itemDeleted'),
                type: 'success',
            });
        } catch (error) {            
            console.error(`Failed to delete dish category with id ${id}:`, error);

            uiStore.showNotification({
                message: t('dishCategory.errorOnDelete'),
                type: 'error',
                duration: 7000
            });
        }
    }

    return {
        dishCategories,
        dishCategory,
        isLoading,
        fetchRecords,
        fetchRecord,
        createRecord,
        updateRecord,
        deleteRecord,
    };
});
