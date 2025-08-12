// stores/incomingInvoices.ts
import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import {api, type PaginatedResponse} from '~/utils/apiClient';
import {useUiStore} from './ui.js';
import {useNuxtApp} from '#app';

/** ================== Типы под ваше API ================== */

// Для списка накладных (warehouse/supplier — вложенные объекты)
interface WarehouseLite { id: number; name: string }
interface SupplierLite { id: number; name: string; bin?: string }

export interface IncomingInvoiceList {
    id: number;
    date: string;           // ISO
    accepted: boolean;
    warehouse: WarehouseLite;
    supplier: SupplierLite;
    commentary: string;
    amount: string;
    shipping_cost: string;
    paid_amount: string;
    author: string;
}

// Для детальной накладной (warehouse/supplier — ID)
export interface DishLite {
    id: number;
    name_kz?: string;
    name_ru?: string;
    name_en?: string;
}
export interface MeasurementUnitLite {
    id: number;
    name_kz?: string;
    name_ru?: string;
    name_en?: string;
}

export interface IncomingInvoiceItem {
    id?: number;
    dish: DishLite | number;                 // в ответе — объект, в payload — ID
    quantity: string;                        // decimal приходит строкой
    measurement_unit: MeasurementUnitLite | number;
    cost_price: string;
    sale_price: string;
}

export interface IncomingInvoiceDetail {
    id: number;
    date: string;            // ISO
    accepted: boolean;
    warehouse: number;       // ID
    supplier: number;        // ID
    commentary: string;
    amount: string;
    shipping_cost: string;
    paid_amount: string;
    author: string;
    invoice_dish_items: IncomingInvoiceItem[];
}

// Пэйлоад на создание/обновление (ID-шники вместо объектов)
export type IncomingInvoicePayload = Omit<
    IncomingInvoiceDetail,
    'id' | 'author' | 'amount' | 'invoice_dish_items'
> & {
    invoice_dish_items: Array<{
        id?: number;
        dish: number;
        measurement_unit: number;
        quantity: string;
        cost_price: string;
        sale_price: string;
    }>;
};

/** ================== Store ================== */

export const useIncomingInvoicesStore = defineStore('incomingInvoices', () => {
    // --- State ---
    const invoices = ref<IncomingInvoiceList[]>([]);
    const invoice = ref<IncomingInvoiceDetail | null>(null);
    const isLoading = ref(false);

    // --- Пагинация/поиск ---
    const totalRecords = ref(0);
    const pageSize = ref(20);
    const currentPage = ref(1);

    // подберите имена фильтров под ваш бэкенд (примерные)
    const searchQuery = ref<{
        supplier?: number | null;
        warehouse?: number | null;
        accepted?: boolean | null;
        date_from?: string | null;   // YYYY-MM-DD
        date_to?: string | null;     // YYYY-MM-DD
    }>({
        supplier: null,
        warehouse: null,
        accepted: null,
        date_from: null,
        date_to: null,
    });

    // --- Getters ---
    const totalPages = computed(() =>
        totalRecords.value ? Math.ceil(totalRecords.value / pageSize.value) : 1
    );

    // --- Helpers ---
    function toPayload(detail: IncomingInvoiceDetail): IncomingInvoicePayload {
        return {
            date: detail.date,
            accepted: detail.accepted,
            warehouse: detail.warehouse,
            supplier: detail.supplier,
            commentary: detail.commentary,
            shipping_cost: detail.shipping_cost,
            paid_amount: detail.paid_amount,
            invoice_dish_items: (detail.invoice_dish_items ?? []).map(it => ({
                id: it.id,
                dish: typeof it.dish === 'number' ? it.dish : it.dish.id,
                measurement_unit:
                    typeof it.measurement_unit === 'number'
                        ? it.measurement_unit
                        : it.measurement_unit.id,
                quantity: it.quantity,
                cost_price: it.cost_price,
                sale_price: it.sale_price,
            })),
        };
    }

    // --- Actions ---

    /** Список с пагинацией и фильтрами */
    async function fetchRecords(page: number = 1) {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;

        isLoading.value = true;
        currentPage.value = page;

        try {
            const params = new URLSearchParams();

            // ВСЕГДА добавляем page и page_size
            params.set('page', page.toString());
            params.set('page_size', pageSize.value.toString());

            // Фильтры (добавляйте/переименуйте под ваш бэк)
            if (searchQuery.value.supplier)  params.set('supplier', String(searchQuery.value.supplier));
            if (searchQuery.value.warehouse) params.set('warehouse', String(searchQuery.value.warehouse));
            if (searchQuery.value.accepted !== null && searchQuery.value.accepted !== undefined) {
                params.set('accepted', String(searchQuery.value.accepted));
            }
            if (searchQuery.value.date_from) params.set('date_from', searchQuery.value.date_from);
            if (searchQuery.value.date_to)   params.set('date_to', searchQuery.value.date_to);

            const url = `/incoming-invoices/?${params.toString()}`;
            const data = await api.docs<PaginatedResponse<IncomingInvoiceList>>(url, { method: 'get' });

            invoices.value = data.results;
            totalRecords.value = data.count;
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

    /** Детальная накладная */
    async function fetchRecord(id: number) {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;
        isLoading.value = true;
        invoice.value = null;

        try {
            invoice.value = await api.docs<IncomingInvoiceDetail>(`/incoming-invoices/${id}/`, {method: 'get'});
        } catch (error) {
            console.error(`Failed to fetch incoming invoice with id ${id}:`, error);
            uiStore.showNotification({ message: t('message.fetchErrorItem'), type: 'error' });
        } finally {
            isLoading.value = false;
        }
    }

    /** Создание */
    async function createRecord(payloadOrDetail: IncomingInvoicePayload | IncomingInvoiceDetail) {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;

        try {
            const payload =
                (payloadOrDetail as any).invoice_dish_items && typeof (payloadOrDetail as any).invoice_dish_items[0]?.dish !== 'object'
                    ? (payloadOrDetail as IncomingInvoicePayload)
                    : toPayload(payloadOrDetail as IncomingInvoiceDetail);

            const created = await api.docs<IncomingInvoiceDetail>('/incoming-invoices/', {
                method: 'POST',
                body: payload,
            });

            uiStore.showNotification({
                message: t('message.createSuccess', { item: t('incomingInvoice.item') }),
                type: 'success',
            });

            return created;
        } catch (error) {
            console.error('Failed to create incoming invoice:', error);
            uiStore.showNotification({
                message: t('message.createError', { item: t('incomingInvoice.item') }),
                type: 'error',
            });
            return null;
        }
    }

    /** Обновление */
    async function updateRecord(id: number, payloadOrDetail: IncomingInvoicePayload | IncomingInvoiceDetail) {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;

        try {
            const payload =
                (payloadOrDetail as any).invoice_dish_items && typeof (payloadOrDetail as any).invoice_dish_items[0]?.dish !== 'object'
                    ? (payloadOrDetail as IncomingInvoicePayload)
                    : toPayload(payloadOrDetail as IncomingInvoiceDetail);

            const updated = await api.docs<IncomingInvoiceDetail>(`/incoming-invoices/${id}/`, {
                method: 'PUT',
                body: payload,
            });

            uiStore.showNotification({
                message: t('message.updateSuccess', { item: t('incomingInvoice.item') }),
                type: 'success',
            });

            return updated;
        } catch (error) {
            console.error(`Failed to update incoming invoice with id ${id}:`, error);
            uiStore.showNotification({
                message: t('message.updateError', { item: t('incomingInvoice.item') }),
                type: 'error',
            });
            return null;
        }
    }

    /** Удаление */
    async function deleteRecord(id: number) {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;

        try {
            await api.docs(`/incoming-invoices/${id}/`, { method: 'DELETE' });
            await fetchRecords(currentPage.value);
            uiStore.showNotification({
                message: t('message.deleteSuccess', { item: t('incomingInvoice.item') }),
                type: 'success',
            });
            return true;
        } catch (error) {
            console.error(`Failed to delete incoming invoice with id ${id}:`, error);
            uiStore.showNotification({
                message: t('message.deleteError', { item: t('incomingInvoice.item') }),
                type: 'error',
            });
            return false;
        }
    }

    /** Сброс */
    function reset() {
        invoices.value = [];
        invoice.value = null;
        isLoading.value = false;
        totalRecords.value = 0;
        currentPage.value = 1;
        searchQuery.value = {
            supplier: null,
            warehouse: null,
            accepted: null,
            date_from: null,
            date_to: null,
        };
    }

    return {
        // state
        invoices, invoice, isLoading, totalRecords, pageSize, currentPage, searchQuery,
        // getters
        totalPages,
        // actions
        fetchRecords, fetchRecord, createRecord, updateRecord, deleteRecord, reset,
    };
});
