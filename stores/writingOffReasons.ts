import {defineStore} from 'pinia';
import {ref} from 'vue';
import {api, type PaginatedResponse} from '~/utils/apiClient';
import {useUiStore} from './ui.js';

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
    const writingOffReasons = ref<WritingOffReason[]>([]);
    const writingOffReason = ref<WritingOffReason | null>(null);
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
        writingOffReasons.value = [];
        writingOffReason.value = null;
        isLoading.value = false;
        totalRecords.value = 0;
        currentPage.value = 1;
        searchQuery.value = { name_kz: '', name_ru: '', id: '' };
    }

    /**
     * Получение списка всех записей с сервера
     * @param {number} page - Номер страницы для загрузки
     * @param language - Текущий язык
     */
    async function fetchRecords(page: number = 1, language: string = 'ru') {
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

            if (language)
                params.append('ordering', `name_${language}`);

            if (params.size == 0) {
                params.append('page', page.toString());
                params.append('page_size', pageSize.value.toString());
            }

            console.log(`writing-off-reasons request params: ${params}`);

            const urlStr = `/writing-off-reasons/?${params.toString()}`;
            const response = await api.refs<PaginatedResponse<WritingOffReason>>(urlStr, { method: 'get' });
            writingOffReasons.value = response.results;
            totalRecords.value = response.count;

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
            writingOffReason.value = await api.refs<WritingOffReason>(`/writing-off-reasons/${id}/`, { method: 'get' });
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
            await api.refs('/writing-off-reasons/', {
                method: 'post',
                body: payload,
            });
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
            await api.refs(`/writing-off-reasons/${id}/`, {
                method: 'put',
                body: payload,
            });

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
            await api.refs(`/writing-off-reasons/${id}/`, {
                method: 'delete',
            });

            writingOffReasons.value = writingOffReasons.value.filter(c => c.id !== id);
            uiStore.showNotification({
                message: t('writingOffReason.itemDeleted'),
                type: 'success',
            });
            return true;
        } catch (error) {
            console.error(`Failed to delete writing-off-reasons with id ${id}:`, error);

            uiStore.showNotification({
                message: t('writingOffReason.errorOnDelete'),
                type: 'error',
                duration: 7000
            });
            return false;
        }
    }

    return {
        writingOffReasons,
        writingOffReason,
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
