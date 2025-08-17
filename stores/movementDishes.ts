import { createDocumentStore } from '~/composables/useDocumentStore';
import type {
    MovementDishList,
    MovementDishDetailRich,
    MovementDishPayload
} from '~/types/documents';

export const useMovementDishesStore = createDocumentStore<
    MovementDishList,
    MovementDishDetailRich,
    MovementDishPayload
>({
    storeId: 'movementDishes',
    endpoint: '/movement-dishes/',
    itemKey: 'movementDish.item',
    itemListKey: 'movementDish.itemList',
});
