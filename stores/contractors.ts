import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {apiClient, type PaginatedResponse} from '~/utils/apiClient'
import {useUiStore} from './ui.js';

// Определяем интерфейс для нашего контрагента
export interface Contractor {
    id: number;
    name: string;
    bin?: string;
    bik?: string;
    bank?: string;
    corr_account?: string;
    check_account?: string;
}

export const useContractorsStore = defineStore('contractors', () => {
    // --- State ---    
    const contractors = ref<Contractor[]>([]);
    const contractor = ref<Contractor | null>(null);
    const isLoading = ref(false);

    // --- Состояние для пагинации и поиска ---
    const totalRecords = ref(0);
    const pageSize = ref(30); // 30 записей на страницу
    const currentPage = ref(1);
    const searchQuery = ref({
        name: '',
        bin: '',
        id: ''
    });

    // --- Getters ---
    const totalPages = computed(() => {
        if (totalRecords.value === 0) return 1;
        return Math.ceil(totalRecords.value / pageSize.value);
    });
    
    const getContractorById = computed(() => {
        return (id: number) => contractors.value.find(c => c.id === id);
    });

    // --- Actions ---
    function reset() {
        contractors.value = [];
        contractor.value = null;
        isLoading.value = false;
        totalRecords.value = 0;
        currentPage.value = 1;
        searchQuery.value = { name: '', bin: '', id: '' };
    }

    /**
     * Получает список контрагентов с учетом пагинации и поиска
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
            if (searchQuery.value.name) {
                params.append('name', searchQuery.value.name);
            }
            if (searchQuery.value.bin) {
                params.append('bin', searchQuery.value.bin);
            }
            if (searchQuery.value.id) {
                params.append('id', searchQuery.value.id);
            }

            if (params.size == 0) {
                params.append('page', page.toString());
                params.append('page_size', pageSize.value.toString());
            }

            console.log(`contractors request params: ${params}`);

            const urlStr = `/contractors/?${params.toString()}`;
            const response = await apiClient<PaginatedResponse<Contractor>>(urlStr);

            contractors.value = response.results;
            totalRecords.value = response.count;

        } catch (error) {            
            const errText = "Ошибка при загрузке контрагентов";
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
     * --- Получение одной записи по ID ---
     */
    async function fetchRecord(id: number) {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;
        isLoading.value = true;
        contractor.value = null; // Очищаем предыдущее значение

        try {
            contractor.value = await apiClient<Contractor>(`/contractors/${id}/`);
        } catch (error) {
            console.error(`Failed to fetch contractor with id ${id}:`, error);
            uiStore.showNotification({
                message: t('message.fetchErrorItem'),
                type: 'error',
            });
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Создает нового контрагента
     */
    async function createRecord(data: Omit<Contractor, 'id'>) {
        const uiStore = useUiStore(); 
        try {
            const newContractor = await apiClient<Contractor>('/contractors/', {
                method: 'POST',
                body: data,
            });
            // Добавляем нового контрагента в начало списка для мгновенного отклика
            contractors.value.unshift(newContractor);
            // или можно сбросить кэш и перезапросить весь список:
            // lastFetched.value = null;
            // await fetchContractors();
        } catch (error) {            
            const errText = "Ошибка при создании контрагента";
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }

    /**
     * Обновляет существующего контрагента
     */
    async function updateRecord(id: number, data: Partial<Omit<Contractor, 'id'>>) {
        const uiStore = useUiStore(); 
        try {
            const updatedContractor = await apiClient<Contractor>(`/contractors/${id}/`, {
                method: 'PATCH',
                body: data,
            });
            // Находим и обновляем контрагента в нашем локальном списке
            const index = contractors.value.findIndex(c => c.id === id);
            if (index !== -1) {
                contractors.value[index] = updatedContractor;
            }
        } catch (error) {            
            const errText = `Ошибка при обновлении контрагента ${id}`;
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }

    /**
     * Удаляет контрагента
     */
    async function deleteRecord(id: number) {

        const uiStore = useUiStore();        
        const nuxtApp = useNuxtApp();        
        const { t } = nuxtApp.$i18n;

        try {
            await apiClient(`/contractors/${id}/`, {
                method: 'DELETE',
            });
            // Удаляем контрагента из локального списка для мгновенного отклика
            contractors.value = contractors.value.filter(c => c.id !== id);
            uiStore.showNotification({
                message: t('contractor.itemDeleted'),
                type: 'success',
            });
        } catch (error) {
            console.error(`Ошибка при удалении контрагента ${id}:`, error);
            uiStore.showNotification({
                message: t('contractor.errorOnDelete'),
                type: 'error',
                duration: 7000
            });
        }
    }

    return {
        contractors,
        contractor,
        isLoading,
        totalRecords,
        pageSize,
        currentPage,
        totalPages,
        searchQuery,
        getContractorById,
        fetchRecords,
        fetchRecord,
        createRecord,
        updateRecord,
        deleteRecord,
        reset,
    };
});