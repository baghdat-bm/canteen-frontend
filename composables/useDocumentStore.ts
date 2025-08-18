import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';
import { useUiStore } from '~/stores/ui';
import { api, type PaginatedResponse } from '~/utils/apiClient';
import type { DocumentInList, DocumentDetail } from '~/types/documents';

// --- Конфигурация для фабрики ---
interface DocumentStoreConfig<ListType, DetailType, PayloadType> {
    storeId: string;      // e.g., 'incomingInvoices'
    endpoint: string;     // e.g., '/incoming-invoices/'
    itemKey: string;      // e.g., 'incomingInvoice' (для переводов)
    itemListKey: string;  // e.g., 'incomingInvoice.itemList'
}

/**
 * Фабрика для создания Pinia-хранилищ для документов (CRUD, пагинация, поиск).
 */
export function createDocumentStore<
    ListType extends DocumentInList,
    DetailType extends DocumentDetail,
    PayloadType
>(config: DocumentStoreConfig<ListType, DetailType, PayloadType>) {

    return defineStore(config.storeId, () => {
        // --- State ---
        const list = ref<ListType[]>([]);
        const single = ref<DetailType | null>(null);
        const isLoading = ref(false);
        const isSubmitting = ref(false);
        const totalRecords = ref(0);
        const pageSize = ref(20);
        const currentPage = ref(1);
        const searchQuery = ref<Record<string, any>>({}); // Универсальный объект для фильтров

        // --- Getters ---
        const totalPages = computed(() =>
            totalRecords.value ? Math.ceil(totalRecords.value / pageSize.value) : 1
        );

        // --- Actions ---
        async function fetchRecords(page: number = 1) {
            const uiStore = useUiStore();
            const { t } = useNuxtApp().$i18n;
            isLoading.value = true;
            currentPage.value = page;
            try {
                const params = new URLSearchParams();
                params.set('page', page.toString());
                params.set('page_size', pageSize.value.toString());

                // Добавляем фильтры из searchQuery
                for (const key in searchQuery.value) {
                    const value = searchQuery.value[key];
                    if (value !== null && value !== undefined && value !== '') {
                        params.set(key, String(value));
                    }
                }

                const url = `${config.endpoint}?${params.toString()}`;
                const data = await api.docs<PaginatedResponse<ListType>>(url, { method: 'get' });
                list.value = data.results;
                totalRecords.value = data.count;
            } catch (error) {
                console.error(`Failed to fetch ${config.storeId}:`, error);
                uiStore.showNotification({ message: t('messages.fetchListError', { item: t(config.itemListKey) }), type: 'error' });
            } finally {
                isLoading.value = false;
            }
        }

        async function fetchRecord(id: number) {
            const uiStore = useUiStore();
            const { t } = useNuxtApp().$i18n;
            isLoading.value = true;
            single.value = null;
            try {
                single.value = await api.docs<DetailType>(`${config.endpoint}${id}/`, { method: 'get' });
            } catch (error) {
                console.error(`Failed to fetch ${config.storeId} with id ${id}:`, error);
                uiStore.showNotification({ message: t('messages.fetchItemError'), type: 'error' });
            } finally {
                isLoading.value = false;
            }
        }

        async function createRecord(payload: PayloadType) {
            const uiStore = useUiStore();
            const { t } = useNuxtApp().$i18n;
            isSubmitting.value = true;
            try {
                const created = await api.docs<DetailType>(config.endpoint, { method: 'POST', body: payload });
                uiStore.showNotification({ message: t('messages.createSuccess', { item: t(config.itemKey) }), type: 'success' });
                return created;
            } catch (error) {
                console.error(`Failed to create ${config.storeId}:`, error);
                uiStore.showNotification({ message: t('messages.createError', { item: t(config.itemKey) }), type: 'error' });
                return null;
            } finally {
                isSubmitting.value = false;
            }
        }

        async function updateRecord(id: number, payload: PayloadType) {
            const uiStore = useUiStore();
            const { t } = useNuxtApp().$i18n;
            isSubmitting.value = true;
            try {
                const updated = await api.docs<DetailType>(`${config.endpoint}${id}/`, { method: 'PUT', body: payload });
                uiStore.showNotification({ message: t('messages.updateSuccess', { item: t(config.itemKey) }), type: 'success' });
                return updated;
            } catch (error) {
                console.error(`Failed to update ${config.storeId} with id ${id}:`, error);
                uiStore.showNotification({ message: t('messages.updateError', { item: t(config.itemKey) }), type: 'error' });
                return null;
            } finally {
                isSubmitting.value = false;
            }
        }

        async function deleteRecord(id: number) {
            const uiStore = useUiStore();
            const { t } = useNuxtApp().$i18n;

            uiStore.showActionOverlay(t('messages.deleting'));

            try {
                await api.docs(`${config.endpoint}${id}/`, { method: 'DELETE' });
                await fetchRecords(currentPage.value);
                uiStore.showNotification({ message: t('messages.deleteSuccess', { item: t(config.itemKey) }), type: 'success' });
                return true;
            } catch (error) {
                console.error(`Failed to delete ${config.storeId} with id ${id}:`, error);
                uiStore.showNotification({ message: t('messages.deleteError', { item: t(config.itemKey) }), type: 'error' });
                return false;
            } finally {
                uiStore.hideActionOverlay();
            }
        }

        return {
            list, single, isLoading, isSubmitting, totalRecords, pageSize,
            currentPage, searchQuery, totalPages,
            fetchRecords, fetchRecord, createRecord, updateRecord, deleteRecord,
        };
    });
}
