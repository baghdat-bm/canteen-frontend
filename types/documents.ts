// Общие "облегченные" типы для связанных сущностей
export interface WarehouseLite { id: number; name: string; }
export interface SupplierLite { id: number; name: string; bin?: string; }
export interface DishLite { id: number; name_kz?: string; name_ru?: string; measurement_unit?: number | null; }
export interface MeasurementUnitLite { id: number; name_kz?: string; name_ru?: string; }
export interface WritingOffReasonLite { id: number; name_kz?: string; name_ru?: string; }

/**
 * Универсальный интерфейс для элемента в табличной части любого документа.
 * T - тип основной сущности (например, DishLite).
 */
export interface DocumentTableItem {
    id?: number;
    dish: DishLite | number;
    quantity: number;
    measurement_unit: MeasurementUnitLite | number;
}

/**
 * Универсальный интерфейс для детальной информации о документе.
 */
export interface DocumentDetail {
    id: number;
    date: string;
    accepted: boolean;
    commentary: string;
    author: string;
}

/**
 * Универсальный интерфейс для элемента в списке документов.
 */
export interface DocumentInList {
    id: number;
    date: string;
    accepted: boolean;
    commentary: string;
    author: string;
}


// ======================================= //
//// --- ПРИХОДНАЯ НАКЛАДНАЯ --- ////

// Элемент табличной части Приходной накладной
export interface IncomingInvoiceItem extends DocumentTableItem {
    cost_price: number;
    amount: number;
    sale_price: number;
}

// Детальная информация о Приходной накладной (для API)
export interface IncomingInvoiceDetail extends DocumentDetail {
    warehouse: number;
    supplier: number;
    shipping_cost: number;
    paid_amount: number;
    amount: number;
    invoice_dish_items: IncomingInvoiceItem[];
}

// Детальная информация о Приходной накладной (для формы, с объектами)
export interface IncomingInvoiceDetailRich extends DocumentDetail {
    warehouse: WarehouseLite | number;
    supplier: SupplierLite | number;
    shipping_cost: number;
    paid_amount: number;
    amount: number;
    invoice_dish_items: IncomingInvoiceItem[];
}

// Элемент в списке Приходных накладных
export interface IncomingInvoiceList extends DocumentInList {
    warehouse: WarehouseLite;
    supplier: SupplierLite;
    amount: number;
    shipping_cost: number;
    paid_amount: number;
}

// Payload для создания/обновления Приходной накладной
export type IncomingInvoicePayload = Omit< IncomingInvoiceDetail, 'id' | 'author'> & {
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


// ======================================= //
//// --- СПИСАНИЕ СО СКЛАДА --- ////

// Элемент табличной части Списания со склада
export type WriteOffDishItem = DocumentTableItem;

// Детальная информация о Списания со склада (для API)
export interface WriteOffDetail extends DocumentDetail {
    warehouse: number;
    writing_off_reason: number;
    write_off_dish_items: WriteOffDishItem[];
}

// Детальная информация о Списания со склада (для формы, с объектами)
export interface WriteOffDetailRich extends DocumentDetail {
    warehouse: WarehouseLite | number;
    writing_off_reason: WritingOffReasonLite | number;
    write_off_dish_items: WriteOffDishItem[];
}

// Элемент в списке Списания со склада
export interface WriteOffList extends DocumentInList {
    warehouse: WarehouseLite;
    writing_off_reason: WritingOffReasonLite;
}

// Payload для создания/обновления Списания со склада
export type WriteOffPayload = Omit< WriteOffDetail, 'id' | 'author'> & {
    write_off_dish_items: Array<{
        id?: number;
        dish: number;
        measurement_unit: number;
        quantity: number;
    }>;
};