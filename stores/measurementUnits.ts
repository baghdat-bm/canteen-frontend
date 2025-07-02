import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '~/utils/apiClient';
import { useUiStore } from './ui.js'; 

// Определяем интерфейс для объекта единицы измерения
export interface MeasurementUnit {
    id: number;
    name_kz: string;
    name_ru: string;
    name_en: string;
}

// Определяем интерфейс для данных, отправляемых при создании (без id)
export type MeasurementUnitPayload = Omit<MeasurementUnit, 'id'>;


export const useMeasurementUnitsStore = defineStore('measurementUnits', () => {
    // --- State ---
    // Список всех единиц измерения
    const measurementUnits = ref<MeasurementUnit[]>([]);
    // Одна выбранная единица измерения
    const measurementUnit = ref<MeasurementUnit | null>(null);
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
    
    function reset() {
        measurementUnits.value = [];
        measurementUnit.value = null;
        lastFetched.value = null;
        isLoading.value = false;
    }


    /**
     * Получение списка всех единиц измерения с сервера
     * @param {boolean} force - Принудительно обновить данные, игнорируя кэш
     */
    async function fetchMeasurementUnits(force = false) {
        const uiStore = useUiStore();
        if (!shouldFetch.value && !force) {
            return;
        }

        isLoading.value = true;
        try {
            const response = await apiClient<MeasurementUnit[]>('/measurement-units/');
            measurementUnits.value = response;
            lastFetched.value = new Date();
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
    async function fetchMeasurementUnit(id: number) {
        const uiStore = useUiStore();
        isLoading.value = true;
        try {
            const response = await apiClient<MeasurementUnit>(`/measurement-units/${id}/`);
            measurementUnit.value = response;
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
    async function createMeasurementUnit(payload: MeasurementUnitPayload) {
        const uiStore = useUiStore();
        try {
            await apiClient('/measurement-units/', {
                method: 'POST',
                body: payload,
            });
            // Инвалидация кэша после создания
            lastFetched.value = null;
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
    async function updateMeasurementUnit(id: number, payload: MeasurementUnitPayload) {
        const uiStore = useUiStore();
        try {
            await apiClient(`/measurement-units/${id}/`, {
                method: 'PUT',
                body: payload,
            });
            // Инвалидация кэша
            lastFetched.value = null;
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
    async function deleteMeasurementUnit(id: number) {

        const uiStore = useUiStore();        
        const nuxtApp = useNuxtApp();        
        const { t } = nuxtApp.$i18n;

        try {
            await apiClient(`/measurement-units/${id}/`, {
                method: 'DELETE',
            });
            // Инвалидация кэша и обновление списка
            lastFetched.value = null;
            await fetchMeasurementUnits(true); // Принудительное обновление

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
        lastFetched,
        shouldFetch,
        fetchMeasurementUnits,
        fetchMeasurementUnit,
        createMeasurementUnit,
        updateMeasurementUnit,
        deleteMeasurementUnit,
        reset,
    };
});
