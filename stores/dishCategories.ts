import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '~/utils/apiClient';

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
        if (!shouldFetch.value && !force) return;
        isLoading.value = true;
        try {
            const response = await apiClient<DishCategory[]>('/dishes-categories/');
            dishCategories.value = response;
            lastFetched.value = new Date();
        } catch (error) {
            console.error('Failed to fetch dish categories:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchRecord(id: number) {
        isLoading.value = true;
        try {
            const response = await apiClient<DishCategory>(`/dishes-categories/${id}/`);
            dishCategory.value = response;
        } catch (error) {
            console.error(`Failed to fetch dish category with id ${id}:`, error);
            dishCategory.value = null;
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
        const formData = createFormData(payload);
        try {
            await apiClient('/dishes-categories/', {
                method: 'POST',
                body: formData,
            });
            lastFetched.value = null;
        } catch (error) {
            console.error('Failed to create dish category:', error);
            throw error;
        }
    }

    async function updateRecord(id: number, payload: DishCategoryPayload) {
        const formData = createFormData(payload);
        try {
            // Используем PATCH, чтобы можно было не отправлять файл, если он не менялся
            await apiClient(`/dishes-categories/${id}/`, {
                method: 'PATCH', 
                body: formData,
            });
            lastFetched.value = null;
        } catch (error) {
            console.error(`Failed to update dish category with id ${id}:`, error);
            throw error;
        }
    }
    
    async function deleteRecord(id: number) {
        try {
            await apiClient(`/dishes-categories/${id}/`, {
                method: 'DELETE',
            });
            lastFetched.value = null;
            await fetchRecords(true);
        } catch (error) {            
            console.error(`Failed to delete dish category with id ${id}:`, error);
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
