// Общие "облегченные" типы для связанных сущностей
export interface WarehouseLite { id: number; name: string; }
export interface SupplierLite { id: number; name: string; bin?: string; }
export interface DishLite { id: number; name_kz?: string; name_ru?: string; measurement_unit?: number | null; }
export interface MeasurementUnitLite { id: number; name_kz?: string; name_ru?: string; }

/**
 * Универсальный интерфейс для элемента в табличной части любого документа.
 * T - тип основной сущности (например, DishLite).
 */
export interface DocumentTableItem<T> {
    id?: number;
    dish: T | number;
    quantity: number;
    measurement_unit: MeasurementUnitLite | number;
    cost_price: number;
    amount: number;
    sale_price: number;
}

/**
 * Универсальный интерфейс для детальной информации о документе.
 */
export interface DocumentDetail<T> {
    id: number;
    date: string;
    accepted: boolean;
    warehouse: WarehouseLite | number;
    supplier: SupplierLite | number; // Поставщик может быть не во всех документах
    commentary: string;
    amount: number;
    shipping_cost: number;
    paid_amount: number;
    author: string;
    items: DocumentTableItem<T>[]; // `items` вместо `invoice_dish_items`
}

/**
 * Универсальный интерфейс для элемента в списке документов.
 */
export interface DocumentInList {
    id: number;
    date: string;
    accepted: boolean;
    warehouse: WarehouseLite;
    supplier: SupplierLite;
    commentary: string;
    amount: number;
    shipping_cost: number;
    paid_amount: number;
    author: string;
}

//// --- Конкретные типы --- ////

// --- Приходная накладная ---

// Элемент табличной части Приходной накладной
export type IncomingInvoiceItem = DocumentTableItem<DishLite>;

// Детальная информация о Приходной накладной (для API)
export interface IncomingInvoiceDetail extends Omit<DocumentDetail<DishLite>, 'items' | 'warehouse' | 'supplier'> {
    warehouse: number;
    supplier: number;
    invoice_dish_items: IncomingInvoiceItem[];
}

// Детальная информация о Приходной накладной (для формы, с объектами)
export interface IncomingInvoiceDetailRich extends Omit<DocumentDetail<DishLite>, 'items'> {
    invoice_dish_items: IncomingInvoiceItem[];
}

// Элемент в списке Приходных накладных
export type IncomingInvoiceList = DocumentInList;

// Payload для создания/обновления
export type IncomingInvoicePayload = Omit<
    IncomingInvoiceDetail,
    'id' | 'author'
> & {
    invoice_dish_items: Array<{
        id?: number;
        dish: number;
        measurement_unit: number;
        quantity: number;
        cost_price: number;
        amount: number;
        sale_price: number;
    }>;
};
