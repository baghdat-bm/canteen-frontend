import { createDocumentStore } from '~/composables/useDocumentStore';
import type {
    WriteOffList,
    WriteOffDetailRich, // Используем Rich-версию для формы
    WriteOffPayload
} from '~/types/documents';

export const useWriteOffsStore = createDocumentStore<
    WriteOffList,
    WriteOffDetailRich,
    WriteOffPayload
>({
    storeId: 'writeOffs',
    endpoint: '/write-off-from-warehouses/',
    itemKey: 'writeOff.item',
    itemListKey: 'writeOff.itemList',
});
