import { createDocumentStore } from '~/composables/useDocumentStore';
import type {
    IncomingInvoiceList,
    IncomingInvoiceDetailRich, // Используем Rich-версию для формы
    IncomingInvoicePayload
} from '~/types/documents';

export const useIncomingInvoicesStore = createDocumentStore<
    IncomingInvoiceList,
    IncomingInvoiceDetailRich,
    IncomingInvoicePayload
>({
    storeId: 'incomingInvoices',
    endpoint: '/incoming-invoices/',
    itemKey: 'incomingInvoice.item',
    itemListKey: 'incomingInvoice.itemList',
});
