import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '~/utils/apiClient';
import { useUiStore } from './ui.js'; 

// Определяем интерфейс для объекта записи
export interface WritingOffReason {
    id: number;
    name_kz: string;
    name_ru: string;
    name_en: string;
    write_off: boolean;
    request_comment: boolean;
}

// Определяем интерфейс для данных, отправляемых при создании (без id)
export type WritingOffReasonPayload = Omit<WritingOffReason, 'id'>;


export const useWritingOffReasonsStore = defineStore('writingOffReasons', () => {
    // --- State ---
    // Список всех записей
    const writingOffReasons = ref<WritingOffReason[]>([]);
    // Одна выбранная запись
    const writingOffReason = ref<WritingOffReason | null>(null);
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
        writingOffReasons.value = [];
        writingOffReason.value = null;
        lastFetched.value = null;
        isLoading.value = false;
    }

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
            const response = await apiClient<WritingOffReason[]>('/writing-off-reasons/');
            writingOffReasons.value = response;
            lastFetched.value = new Date();
        } catch (error) {            
            const errText = 'Failed to fetch writing-off-reasons';
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
            const response = await apiClient<WritingOffReason>(`/writing-off-reasons/${id}/`);
            writingOffReason.value = response;
        } catch (error) {            
            writingOffReason.value = null;
            const errText = `Failed to fetch writing-off-reasons with id ${id}`;
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
     * Создание новой записи
     * @param {WritingOffReasonPayload} payload - Данные для создания
     */
    async function createRecord(payload: WritingOffReasonPayload) {
        const uiStore = useUiStore(); 
        try {
            await apiClient('/writing-off-reasons/', {
                method: 'POST',
                body: payload,
            });
            // Инвалидация кэша после создания
            lastFetched.value = null;
        } catch (error) {            
            const errText = 'Failed to create writing-off-reasons';
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
            console.error(errText, error);  
        }
    }

    /**
     * Обновление существующей записи
     * @param {number} id - ID записи
     * @param {WritingOffReasonPayload} payload - Данные для обновления
     */
    async function updateRecord(id: number, payload: WritingOffReasonPayload) {
        const uiStore = useUiStore(); 
        try {
            await apiClient(`/writing-off-reasons/${id}/`, {
                method: 'PUT',
                body: payload,
            });
            // Инвалидация кэша
            lastFetched.value = null;
        } catch (error) {
            const errText = `Failed to update writing-off-reasons with id ${id}`;
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
            await apiClient(`/writing-off-reasons/${id}/`, {
                method: 'DELETE',
            });
            // Инвалидация кэша и обновление списка
            lastFetched.value = null;
            await fetchRecords(true); // Принудительное обновление

            uiStore.showNotification({
                message: t('writingOffReason.itemDeleted'),
                type: 'success',
            });
        } catch (error) {
            console.error(`Failed to delete writing-off-reasons with id ${id}:`, error);

            uiStore.showNotification({
                message: t('writingOffReason.errorOnDelete'),
                type: 'error',
                duration: 7000
            });
        }
    }

    return {
        writingOffReasons,
        writingOffReason,
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
