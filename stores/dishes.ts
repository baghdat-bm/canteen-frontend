import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import {apiClient, type PaginatedResponse} from '~/utils/apiClient';
import {useUiStore} from './ui.js';

// Интерфейс для объекта категории блюд
export interface Dish {
    id: number;
    name_kz: string;
    name_ru: string;
    name_en: string;
    category: number;
    logo: string;
    barcode: string;
    measurement_unit?: number | null;
}

// Тип для данных, отправляемых на сервер (без id)
export interface DishPayload {
    name_kz: string;
    name_ru: string;
    name_en: string;
    category: number | null;
    logo?: File | null;
    barcode?: string | null;
    measurement_unit: number | null;
}

export const useDishStore = defineStore('dishes', () => {
    // --- State ---
    const dishes = ref<Dish[]>([]);
    const dish = ref<Dish | null>(null);
    const isLoading = ref(false);
    
    // --- Состояние для пагинации и поиска ---
    const totalRecords = ref(0);
    const pageSize = ref(30); // 30 записей на страницу
    const currentPage = ref(1);
    const searchQuery = ref({
        name_kz: '',
        name_ru: '',
        barcode: '',
        category: '',
        id: ''
    });

    // --- Getters ---
    const totalPages = computed(() => {
        if (totalRecords.value === 0) return 1;
        return Math.ceil(totalRecords.value / pageSize.value);
    });

    // --- Actions ---
    
    function reset() {
        dishes.value = [];
        dish.value = null;
        isLoading.value = false;
        totalRecords.value = 0;
        currentPage.value = 1;
        searchQuery.value = { name_kz: '', name_ru: '', barcode: '', category: '', id: '' };
    }

    /**
     * Получение списка всех записей с сервера с учетом пагинации и поиска
     * @param {number} page - Номер страницы для загрузки
     */
    async function fetchRecords(page: number = 1) {
        const uiStore = useUiStore();
        isLoading.value = true;
        currentPage.value = page;

        try {
            const params = new URLSearchParams();

            // Добавляем параметры поиска, если они не пустые
            if (searchQuery.value.name_kz) {
                params.append('name_kz', searchQuery.value.name_kz);
            }
            if (searchQuery.value.name_ru) {
                params.append('name_ru', searchQuery.value.name_ru);
            }
            if (searchQuery.value.barcode) {
                params.append('barcode', searchQuery.value.barcode);
            }
            if (searchQuery.value.category) {
                params.append('category', searchQuery.value.category);
            }
            if (searchQuery.value.id) {
                params.append('id', searchQuery.value.id);
            }

            if (params.size == 0) {
                params.append('page', page.toString());
                params.append('page_size', pageSize.value.toString());
            }

            console.log(`dishes request params: ${params}`);

            const urlStr = `/dishes/?${params.toString()}`;
            const response = await apiClient<PaginatedResponse<Dish>>(urlStr);
            dishes.value = response.results;
            totalRecords.value = response.count;

        } catch (error) {            
            const errText = 'Failed to fetch dishes';
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
            dish.value = await apiClient<Dish>(`/dishes/${id}/`);
        } catch (error) {            
            dish.value = null;
            const errText = `Failed to fetch dish with id ${id}`;
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
    function createFormData(payload: DishPayload): FormData {
        const formData = new FormData();
        formData.append('name_kz', payload.name_kz);
        formData.append('name_ru', payload.name_ru);
        formData.append('name_en', payload.name_en);
        formData.append('barcode', payload.barcode ? payload.barcode : '');
        if (payload.measurement_unit) {
            formData.append('measurement_unit', String(payload.measurement_unit));
        }
        if (payload.category) {
            formData.append('category', String(payload.category));
        }
        // Добавляем файл, только если он был выбран
        if (payload.logo instanceof File) {
            formData.append('logo', payload.logo);
        }
        return formData;
    }

    async function createRecord(payload: DishPayload) {
        const uiStore = useUiStore(); 
        const formData = createFormData(payload);
        try {
            await apiClient('/dishes/', {
                method: 'POST',
                body: formData,
            });

        } catch (error) {            
            const errText = 'Failed to create dish';
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
            console.error(errText, error); 
        }
    }

    async function updateRecord(id: number, payload: DishPayload) {
        const uiStore = useUiStore(); 
        const formData = createFormData(payload);
        try {
            // Используем PATCH, чтобы можно было не отправлять файл, если он не менялся
            await apiClient(`/dishes/${id}/`, {
                method: 'PATCH', 
                body: formData,
            });

        } catch (error) {            
            const errText = `Failed to update dish with id ${id}`;
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
            console.error(errText, error); 
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
            await apiClient(`/dishes/${id}/`, {
                method: 'DELETE',
            });

            dishes.value = dishes.value.filter(c => c.id !== id);
            uiStore.showNotification({
                message: t('dish.itemDeleted'),
                type: 'success',
            });            
        } catch (error) {            
            console.error(`Failed to delete dish with id ${id}:`, error);

            uiStore.showNotification({
                message: t('dish.errorOnDelete'),
                type: 'error',
                duration: 7000
            });
        }
    }

    return {
        dishes,
        dish,
        isLoading,
        totalRecords,
        currentPage,
        pageSize,
        totalPages,
        searchQuery,
        fetchRecords,
        fetchRecord,
        createRecord,
        updateRecord,
        deleteRecord,
        reset,
    };
});
