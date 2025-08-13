<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useWarehouseStore } from '~/stores/warehouses';
import { useContractorsStore } from '~/stores/contractors';
import ContractorPickerDialog from '~/components/contractors/ContractorPickerDialog.vue';

/** ===== Типы формы ===== */
type ID = number;

interface DishLite {
  id: ID;
  name_kz?: string; name_ru?: string; name_en?: string;
}
interface UnitLite {
  id: ID;
  name_kz?: string; name_ru?: string; name_en?: string;
}

export interface InvoiceItemForm {
  id?: ID;
  dish: ID | DishLite;                // в деталях может прийти объект — поддерживаем оба варианта
  measurement_unit: ID | UnitLite;
  quantity: string;                   // decimal как строка
  cost_price: string;
  sale_price: string;
}

export interface IncomingInvoiceFormModel {
  id?: ID;
  date: string;                       // ISO (бэку так удобнее)
  accepted: boolean;
  warehouse: ID | null;               // ID склада
  supplier: ID | null;                // ID контрагента
  commentary: string;
  shipping_cost: string;
  paid_amount: string;
  invoice_dish_items: InvoiceItemForm[];
}

/** ===== v-model формы ===== */
const model = defineModel<IncomingInvoiceFormModel>();

function defaultModel(): IncomingInvoiceFormModel {
  return {
    date: new Date().toISOString(),   // сохраним ISO; инпут покажет локально через dateLocal
    accepted: false,
    warehouse: null,
    supplier: null,
    commentary: '',
    shipping_cost: '0',
    paid_amount: '0',
    invoice_dish_items: [],
  };
}

// если родитель пока не дал v-model — создаём локально, чтобы не падать
if (!model.value) {
  model.value = defaultModel();
}

/** ===== Stores ===== */
const warehousesStore = useWarehouseStore();
const contractorsStore = useContractorsStore();

/** ===== Локальное состояние ===== */
const isContractorDialogOpen = ref(false);
const supplierName = ref<string>('');

/** Заголовок кнопки Сохранить (если нужно менять — можно передать пропсом) */
const props = defineProps<{
  submitLabel?: string
  disabled?: boolean
}>();
const emit = defineEmits<{
  (e: 'submit', payload: any): void
  (e: 'cancel'): void
}>();

/** ===== Вспомогалки ===== */
function objId(v: number | { id: number }): number | null {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'object' && 'id' in v) return (v as any).id ?? null;
  return null;
}

const itemsTotal = computed(() => {
  // локальный «подсчёт суммы» — чисто для UI, бек всё равно посчитает сам
  return (model.value.invoice_dish_items || []).reduce((sum, it) => {
    const q = parseFloat(it.quantity || '0') || 0;
    const p = parseFloat(it.cost_price || '0') || 0;
    return sum + q * p;
  }, 0);
});

function addItem() {
  model.value.invoice_dish_items.push({
    dish: null as unknown as number,              // позже заменим на селектор блюд
    measurement_unit: null as unknown as number,  // и селектор единиц
    quantity: '0',
    cost_price: '0',
    sale_price: '0',
  });
}
function removeItem(idx: number) {
  model.value.invoice_dish_items.splice(idx, 1);
}

function pad(n: number) { return n.toString().padStart(2, '0'); }

function isoToLocalInput(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

// вернём ISO со смещением (например, +05:00), как любит твой бэкенд
function localInputToIsoWithOffset(local: string): string {
  if (!local) return '';
  // 'YYYY-MM-DDTHH:mm' трактуется как локальное время
  const d = new Date(local);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  // getTimezoneOffset: минуты, которые нужно ДОБАВИТЬ к локальному, чтобы получить UTC.
  // Для Asia/Almaty (UTC+5) offset будет -300.
  const offMin = -d.getTimezoneOffset();
  const sign = offMin >= 0 ? '+' : '-';
  const oh = pad(Math.floor(Math.abs(offMin) / 60));
  const om = pad(Math.abs(offMin) % 60);

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${sign}${oh}:${om}`;
}

// двусторонняя «прокладка» под datetime-local
const dateLocal = computed<string>({
  get: () => isoToLocalInput(model.value?.date ?? ''),
  set: (v) => {
    if (!model.value) model.value = defaultModel();
    model.value.date = localInputToIsoWithOffset(v);
  },
});

/** ===== Поставщик: показ имени + диалог выбора ===== */
async function loadSupplierName(id: number | null) {
  if (!id) { supplierName.value = ''; return; }
  // тянем одну запись (метод есть в сторе)
  const c = await contractorsStore.fetchOne(id);
  supplierName.value = c?.name ?? '';
}

function onContractorSelected(c: { id: number; name: string }) {
  model.value.supplier = c.id;
  supplierName.value = c.name;
}

function clearSupplier() {
  model.value.supplier = null;
  supplierName.value = '';
}

function normalizeItems() {
  // приводим поле к числовому ID, если вдруг пришёл объект
  model.value.invoice_dish_items = (model.value.invoice_dish_items || []).map(it => ({
    ...it,
    dish: objId(it.dish),                 // было: number | object → стало: number | null
    measurement_unit: objId(it.measurement_unit),
  }));
}

/** ===== Жизненный цикл ===== */
onMounted(async () => {
  // для селекта склада
  if (!warehousesStore.warehouses.length) {
    await warehousesStore.fetchRecords(1);
  }
  // если форма открыта в режиме редактирования
  await loadSupplierName(objId(model.value.supplier));
  normalizeItems();
});

// если родитель когда-то заменит массив целиком
// watch(() => model.value.invoice_dish_items, () => normalizeItems(), { deep: false });

// watch(() => model.value.supplier, (id) => {
//   loadSupplierName(objId(id));
// });

/** ===== Сабмит ===== */
// Нормализация payload: dish/measurement_unit всегда ID
function toPayload(m: IncomingInvoiceFormModel) {
  return {
    date: m.date,
    accepted: m.accepted,
    warehouse: objId(m.warehouse),
    supplier: objId(m.supplier),
    commentary: m.commentary,
    shipping_cost: m.shipping_cost,
    paid_amount: m.paid_amount,
    invoice_dish_items: (m.invoice_dish_items || []).map(it => ({
      id: it.id,
      dish: objId(it.dish),
      measurement_unit: objId(it.measurement_unit),
      quantity: it.quantity,
      cost_price: it.cost_price,
      sale_price: it.sale_price,
    })),
  };
}

function onSubmit() {
  emit('submit', toPayload(model.value));
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <!-- Общие поля -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Дата -->
      <div class="space-y-1">
        <label class="block text-sm text-gray-600">Дата и время</label>
        <input
            v-model="dateLocal"
            type="datetime-local"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        />
      </div>

      <!-- Статус -->
      <div class="space-y-1">
        <label class="block text-sm text-gray-600">Статус</label>
        <div class="h-10 flex items-center gap-2 rounded-lg border border-gray-300 px-3">
          <input id="accepted" v-model="model.accepted" type="checkbox" class="rounded" />
          <label for="accepted" class="text-sm">Проведён (принят)</label>
        </div>
      </div>

      <!-- Склад -->
      <div class="space-y-1">
        <label class="block text-sm text-gray-600">Склад</label>
        <select
            v-model="model.warehouse"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        >
          <option :value="null">— Выберите склад —</option>
          <option v-for="w in warehousesStore.warehouses" :key="w.id" :value="w.id">
            {{ w.name }}
          </option>
        </select>
      </div>

      <!-- Поставщик (диалог под кнопкой) -->
      <div class="space-y-1">
        <label class="block text-sm text-gray-600">Поставщик</label>
        <div class="flex items-center gap-2">
          <input
              :value="supplierName"
              readonly
              class="flex-1 rounded-lg border-gray-300 bg-gray-50 focus:border-gray-900 focus:ring-gray-900"
              placeholder="Не выбран"
          />
          <button
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
              @click="isContractorDialogOpen = true"
          >
            Выбрать
          </button>
          <button
              v-if="model.supplier"
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-medium border hover:bg-gray-50"
              @click="clearSupplier"
              title="Очистить"
          >
            Очистить
          </button>
        </div>
        <input type="hidden" name="supplier" :value="objId(model.supplier) ?? ''" />
      </div>

      <!-- Комментарий -->
      <div class="md:col-span-2 space-y-1">
        <label class="block text-sm text-gray-600">Комментарий</label>
        <textarea
            v-model="model.commentary"
            rows="2"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        />
      </div>

      <!-- Стоимости -->
      <div class="space-y-1">
        <label class="block text-sm text-gray-600">Стоимость доставки</label>
        <input
            v-model="model.shipping_cost"
            type="number"
            step="0.01"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 text-right tabular-nums"
        />
      </div>
      <div class="space-y-1">
        <label class="block text-sm text-gray-600">Оплачено</label>
        <input
            v-model="model.paid_amount"
            type="number"
            step="0.01"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 text-right tabular-nums"
        />
      </div>
    </div>

    <!-- Табличная часть: позиции -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold">Позиции накладной</h3>
        <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
            @click="addItem"
        >
          + Добавить позицию
        </button>
      </div>

      <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="px-3 py-2 text-left font-medium">Блюдо (ID)</th>
              <th class="px-3 py-2 text-left font-medium">Ед. изм. (ID)</th>
              <th class="px-3 py-2 text-right font-medium">Кол-во</th>
              <th class="px-3 py-2 text-right font-medium">Себестоимость</th>
              <th class="px-3 py-2 text-right font-medium">Цена продажи</th>
              <th class="px-3 py-2 text-right font-medium">Удалить</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="(it, idx) in model.invoice_dish_items"
                :key="it.id ?? idx"
                class="border-t"
            >
              <td class="px-3 py-2">
                <!-- Пока ввод ID; позже заменим на селектор блюд -->
                <input
                    v-model.number="(it.dish as any)"
                    type="number"
                    class="w-28 rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </td>
              <td class="px-3 py-2">
                <!-- Пока ввод ID; позже заменим на селектор единиц -->
                <input
                    v-model.number="(it.measurement_unit as any)"
                    type="number"
                    class="w-28 rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </td>
              <td class="px-3 py-2">
                <input
                    v-model="it.quantity"
                    type="number"
                    step="0.01"
                    class="w-28 rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 text-right tabular-nums"
                />
              </td>
              <td class="px-3 py-2">
                <input
                    v-model="it.cost_price"
                    type="number"
                    step="0.01"
                    class="w-28 rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 text-right tabular-nums"
                />
              </td>
              <td class="px-3 py-2">
                <input
                    v-model="it.sale_price"
                    type="number"
                    step="0.01"
                    class="w-28 rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 text-right tabular-nums"
                />
              </td>
              <td class="px-3 py-2 text-right">
                <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-medium border hover:bg-gray-50"
                    @click="removeItem(idx)"
                    title="Удалить строку"
                >
                  ✕
                </button>
              </td>
            </tr>

            <tr v-if="model.invoice_dish_items.length === 0">
              <td colspan="6" class="px-3 py-6 text-center text-gray-500">
                Позиции не добавлены
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-end gap-6 border-t px-4 py-3 text-sm">
          <div class="text-gray-600">
            Промежуточный итог: <span class="font-medium tabular-nums">{{ itemsTotal.toFixed(2) }}</span>
          </div>
          <div class="text-gray-600">
            Доставка: <span class="font-medium tabular-nums">{{ (parseFloat(model.shipping_cost || '0') || 0).toFixed(2) }}</span>
          </div>
          <div class="text-gray-900 font-semibold">
            Итого к оплате: <span class="tabular-nums">
              {{ (itemsTotal + (parseFloat(model.shipping_cost || '0') || 0)).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="flex items-center justify-end gap-2">
      <button
          type="button"
          class="rounded-lg px-3 py-2 text-sm font-medium border hover:bg-gray-50"
          @click="$emit('cancel')"
      >
        Отмена
      </button>
      <button
          type="submit"
          :disabled="props.disabled"
          class="rounded-lg px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {{ props.submitLabel ?? 'Сохранить' }}
      </button>
    </div>

    <!-- Диалог выбора контрагента -->
    <ContractorPickerDialog
        v-model:open="isContractorDialogOpen"
        @select="onContractorSelected"
    />
  </form>
</template>

<style scoped>
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>
