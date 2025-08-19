import { createDocumentStore } from '~/composables/useDocumentStore';
import type {
    SellingDishList,
    SellingDishDetailRich, // Используем Rich-версию для формы
    SellingDishPayload
} from '~/types/documents';

export const useSellingDishesStore = createDocumentStore<
    SellingDishList,
    SellingDishDetailRich,
    SellingDishPayload
>({
    storeId: 'sellingDishes',
    endpoint: '/selling-dishes/',
    itemKey: 'sellingDish.item',
    itemListKey: 'sellingDish.itemList',
});
