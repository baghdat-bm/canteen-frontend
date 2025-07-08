import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '~/utils/apiClient';
import { useUiStore } from './ui.js';
import { useNuxtApp } from '#app';

// --- Интерфейсы данных ---

// Интерфейс для элемента в табличной части документа
export interface IncomingInvoiceItem {
    id?: number; // ID опционален, т.к. при создании его еще нет
    dish: { // Блюдо - вложенный объект
        id: number;
        name: string;
    };
    quantity: number;
    price: number;
}

// Интерфейс для самого документа "Приходная накладная"
export interface IncomingInvoice {
    id: number;
    doc_number: string;
    doc_date: string; // Дату храним как строку в формате YYYY-MM-DD
    notes: string;
    items: IncomingInvoiceItem[];
}

// Интерфейс для ответа API с пагинацией
export interface PaginatedResponse<T> {
    count: number;
    results: T[];
}

// Интерфейс для данных, отправляемых на сервер при создании/обновлении
// Мы убираем ID и номер документа, т.к. они назначаются сервером
export type IncomingInvoicePayload = Omit<IncomingInvoice, 'id' | 'doc_number'> & {
    items: Array<Omit<IncomingInvoiceItem, 'id' | 'dish'> & { dish_id: number }>;
};


export const useIncomingInvoicesStore = defineStore('incomingInvoices', () => {
    // --- State ---
    const invoices = ref<IncomingInvoice[]>([]); // Список для текущей страницы
    const invoice = ref<IncomingInvoice | null>(null); // Одна выбранная накладная
    const isLoading = ref(false);

    // --- Состояние для пагинации и поиска ---
    const totalRecords = ref(0);
    const pageSize = ref(20); // Записей на страницу
    const currentPage = ref(1);
    const searchQuery = ref({
        doc_number: '',
        notes: ''
    });

    // --- Getters ---
    const totalPages = computed(() => {
        if (totalRecords.value === 0) return 1;
        return Math.ceil(totalRecords.value / pageSize.value);
    });

    // --- Actions ---

    /**
     * Получение списка накладных с учетом пагинации и поиска
     * @param {number} page - Номер страницы
     */
    async function fetchRecords(page: number = 1) {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;
        isLoading.value = true;
        currentPage.value = page;

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                page_size: pageSize.value.toString(),
            });

            if (searchQuery.value.doc_number) params.append('doc_number__icontains', searchQuery.value.doc_number);
            if (searchQuery.value.notes) params.append('notes__icontains', searchQuery.value.notes);

            const response = await apiClient<PaginatedResponse<IncomingInvoice>>(`/incoming-invoices/?${params.toString()}`);

            invoices.value = response.results;
            totalRecords.value = response.count;

        } catch (error) {
            console.error('Failed to fetch incoming invoices:', error);
            uiStore.showNotification({
                message: t('message.fetchError', { item: t('incomingInvoice.itemList') }),
                type: 'error',
            });
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Получение одной накладной по ID
     * @param {number} id - ID накладной
     */
    async function fetchRecord(id: number) {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;
        isLoading.value = true;
        invoice.value = null;

        try {
            const response = await apiClient<IncomingInvoice>(`/incoming-invoices/${id}/`);
            invoice.value = response;
        } catch (error) {
            console.error(`Failed to fetch incoming invoice with id ${id}:`, error);
            uiStore.showNotification({ message: t('message.fetchErrorItem'), type: 'error' });
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Создание новой накладной
     * @param {IncomingInvoicePayload} payload - Данные для создания
     * @returns {Promise<IncomingInvoice | null>} - Возвращает созданный объект или null в случае ошибки
     */
    async function createRecord(payload: IncomingInvoicePayload): Promise<IncomingInvoice | null> {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;

        try {
            const newInvoice = await apiClient<IncomingInvoice>('/incoming-invoices/', {
                method: 'POST',
                body: payload,
            });
            uiStore.showNotification({ message: t('message.createSuccess', { item: t('incomingInvoice.item') }), type: 'success' });
            return newInvoice;
        } catch (error) {
            console.error('Failed to create incoming invoice:', error);
            uiStore.showNotification({ message: t('message.createError', { item: t('incomingInvoice.item') }), type: 'error' });
            return null;
        }
    }

    /**
     * Обновление существующей накладной
     * @param {number} id - ID накладной
     * @param {IncomingInvoicePayload} payload - Данные для обновления
     * @returns {Promise<IncomingInvoice | null>} - Возвращает обновленный объект или null в случае ошибки
     */
    async function updateRecord(id: number, payload: IncomingInvoicePayload): Promise<IncomingInvoice | null> {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;

        try {
            const updatedInvoice = await apiClient<IncomingInvoice>(`/incoming-invoices/${id}/`, {
                method: 'PUT',
                body: payload,
            });
            uiStore.showNotification({ message: t('message.updateSuccess', { item: t('incomingInvoice.item') }), type: 'success' });
            return updatedInvoice;
        } catch (error) {
            console.error(`Failed to update incoming invoice with id ${id}:`, error);
            uiStore.showNotification({ message: t('message.updateError', { item: t('incomingInvoice.item') }), type: 'error' });
            return null;
        }
    }

    /**
     * Удаление накладной
     * @param {number} id - ID накладной
     * @returns {Promise<boolean>} - Возвращает true в случае успеха
     */
    async function deleteRecord(id: number): Promise<boolean> {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;

        try {
            await apiClient(`/incoming-invoices/${id}/`, {
                method: 'DELETE',
            });
            uiStore.showNotification({ message: t('message.deleteSuccess', { item: t('incomingInvoice.item') }), type: 'success' });
            // Вместо ручного удаления из списка, просто перезагружаем данные для текущей страницы
            await fetchRecords(currentPage.value);
            return true;
        } catch (error) {
            console.error(`Failed to delete incoming invoice with id ${id}:`, error);
            uiStore.showNotification({ message: t('message.deleteError', { item: t('incomingInvoice.item') }), type: 'error' });
            return false;
        }
    }

    /**
     * Сброс состояния хранилища
     */
    function reset() {
        invoices.value = [];
        invoice.value = null;
        isLoading.value = false;
        totalRecords.value = 0;
        currentPage.value = 1;
        searchQuery.value = { doc_number: '', notes: '' };
    }

    return {
        // State
        invoices,
        invoice,
        isLoading,
        totalRecords,
        pageSize,
        currentPage,
        searchQuery,
        // Getters
        totalPages,
        // Actions
        fetchRecords,
        fetchRecord,
        createRecord,
        updateRecord,
        deleteRecord,
        reset,
    };
});
