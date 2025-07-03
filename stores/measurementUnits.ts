import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import {apiClient, type PaginatedResponse} from '~/utils/apiClient'
import {useUiStore} from './ui.js';

// Определяем интерфейс для объекта единицы измерения
export interface MeasurementUnit {
    id: number;
    name_kz: string;
    name_ru: string;
    name_en?: string;
}

// Определяем интерфейс для данных, отправляемых при создании (без id)
export type MeasurementUnitPayload = Omit<MeasurementUnit, 'id'>;


export const useMeasurementUnitsStore = defineStore('measurementUnits', () => {
    // --- State ---
    const measurementUnits = ref<MeasurementUnit[]>([]);
    const measurementUnit = ref<MeasurementUnit | null>(null);
    const isLoading = ref(false);

    // --- Состояние для пагинации и поиска ---
    const totalRecords = ref(0);
    const pageSize = ref(30); // 30 записей на страницу
    const currentPage = ref(1);
    const searchQuery = ref({
        name_kz: '',
        name_ru: '',
        id: ''
    });

    // --- Getters ---
    const totalPages = computed(() => {
        if (totalRecords.value === 0) return 1;
        return Math.ceil(totalRecords.value / pageSize.value);
    });

    // --- Actions ---
    
    function reset() {
        measurementUnits.value = [];
        measurementUnit.value = null;
        isLoading.value = false;
        totalRecords.value = 0;
        currentPage.value = 1;
        searchQuery.value = { name_kz: '', name_ru: '', id: '' };
    }


    /**
     * Получение списка всех единиц измерения с сервера с учетом пагинации и поиска
     * @param {number} page - Номер страницы для загрузки
     */
    async function fetchRecords(page: number = 1) {
        const uiStore = useUiStore();
        isLoading.value = true;
        currentPage.value = page;

        try {
            // Используем URLSearchParams для удобного формирования query-параметров
            const params = new URLSearchParams();

            // Добавляем параметры поиска, если они не пустые
            if (searchQuery.value.name_kz) {
                params.append('name_kz', searchQuery.value.name_kz);
            }
            if (searchQuery.value.name_ru) {
                params.append('name_ru', searchQuery.value.name_ru);
            }
            if (searchQuery.value.id) {
                params.append('id', searchQuery.value.id);
            }

            if (params.size == 0) {
                params.append('page', page.toString());
                params.append('page_size', pageSize.value.toString());
            }

            console.log(`measurement-units request params: ${params}`);

            const urlStr = `/measurement-units/?${params.toString()}`;
            const response = await apiClient<PaginatedResponse<MeasurementUnit>>(urlStr);
            measurementUnits.value = response.results;
            totalRecords.value = response.count;

        } catch (error) {            
            const errText = 'Failed to fetch measurement units';
            console.error(errText, error);
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
     * Получение одной единицы измерения по ID
     * @param {number} id - ID единицы измерения
     */
    async function fetchRecord(id: number) {
        const uiStore = useUiStore();
        isLoading.value = true;
        try {
            measurementUnit.value = await apiClient<MeasurementUnit>(`/measurement-units/${id}/`);
        } catch (error) {            
            measurementUnit.value = null;
            const errText = `Failed to fetch measurement unit with id ${id}`;
            console.error(errText, error);
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
     * Создание новой единицы измерения
     * @param {MeasurementUnitPayload} payload - Данные для создания
     */
    async function createRecord(payload: MeasurementUnitPayload) {
        const uiStore = useUiStore();
        try {
            await apiClient('/measurement-units/', {
                method: 'POST',
                body: payload,
            });
        } catch (error) {            
            const errText = 'Failed to create measurement unit';
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }

    /**
     * Обновление существующей единицы измерения
     * @param {number} id - ID единицы измерения
     * @param {MeasurementUnitPayload} payload - Данные для обновления
     */
    async function updateRecord(id: number, payload: MeasurementUnitPayload) {
        const uiStore = useUiStore();
        try {
            await apiClient(`/measurement-units/${id}/`, {
                method: 'PUT',
                body: payload,
            });
        } catch (error) {            
            const errText = `Failed to update measurement unit with id ${id}`;
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }
    
    /**
     * Удаление единицы измерения
     * @param {number} id - ID единицы измерения
     */
    async function deleteRecord(id: number) {

        const uiStore = useUiStore();        
        const nuxtApp = useNuxtApp();        
        const { t } = nuxtApp.$i18n;

        try {
            await apiClient(`/measurement-units/${id}/`, {
                method: 'DELETE',
            });

            measurementUnits.value = measurementUnits.value.filter(c => c.id !== id);
            uiStore.showNotification({
                message: t('measurementUnit.itemDeleted'),
                type: 'success',
            });
        } catch (error) {
            console.error(`Failed to delete measurement unit with id ${id}:`, error);

            uiStore.showNotification({
                message: t('measurementUnit.errorOnDelete'),
                type: 'error',
                duration: 7000
            });
        }
    }

    return {
        measurementUnits,
        measurementUnit,
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
