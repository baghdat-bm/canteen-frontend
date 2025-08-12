<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import { useWarehouseStore } from '~/stores/warehouses';
import { useContractorsStore } from '~/stores/contractors';
import { useDishStore } from '~/stores/dishes';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import { storeToRefs } from 'pinia';
import type {
  IncomingInvoiceDetail,
  IncomingInvoiceItem,
  IncomingInvoicePayload,
} from '~/stores/incomingInvoices';

type Mode = 'create' | 'edit' | 'view';

const props = defineProps<{
  mode: Mode;
  // для create можно не передавать, для edit/view обязательно
  model?: IncomingInvoiceDetail | null;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: IncomingInvoicePayload): void;
  (e: 'cancel'): void;
}>();

// ===== Stores =====
const warehousesStore = useWarehouseStore();
const { warehouses } = storeToRefs(warehousesStore);

const contractorsStore = useContractorsStore();
const { contractors } = storeToRefs(contractorsStore);

const dishesStore = useDishStore();
const { dishes } = storeToRefs(dishesStore);

const muStore = useMeasurementUnitsStore();
const { measurementUnits } = storeToRefs(muStore);

// ===== Local state (редактируемая копия) =====
const form = reactive<{
  date: string;
  accepted: boolean;
  warehouse: number | null;
  supplier: number | null;
  commentary: string;
  shipping_cost: string; // decimal as string
  paid_amount: string;   // calc
  invoice_dish_items: Array<IncomingInvoiceItem>;
}>({
  date: '',
  accepted: false,
  warehouse: null,
  supplier: null,
  commentary: '',
  shipping_cost: '0.00',
  paid_amount: '0.00',
  invoice_dish_items: [],
});

// ===== helpers =====
function to2(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2);
}
function parseDec(s: string | number | null | undefined) {
  if (s === null || s === undefined || s === '') return 0;
  const v = typeof s === 'number' ? s : parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(v) ? v : 0;
}
function isoToLocalInput(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}
function localInputToIso(localStr: string) {
  if (!localStr) return '';
  // new Date(localStr) интерпретирует как локальную -> переводим в ISO (Z)
  return new Date(localStr).toISOString();
}
async function ensureSupplierOption() {
  if (!form.supplier) return;
  const id = Number(form.supplier);
  const has = contractors.value.some(c => Number(c.id) === id);
  if (!has && contractorsStore.fetchOne) {
    await contractorsStore.fetchOne(id);
  }
}

const isReadOnly = computed(() => props.mode === 'view');

// amount — только для показа (на бэке тоже считается)
const amount = computed(() => {
  const sum = form.invoice_dish_items.reduce((acc, it) => {
    const qty = parseDec(it.quantity as unknown as string);
    const cp = parseDec(it.cost_price as unknown as string);
    return acc + qty * cp;
  }, 0);
  return to2(sum);
});

// пересчёт paid_amount при изменении позиций/доставки
watch([() => form.invoice_dish_items, () => form.shipping_cost], () => {
  const total = parseDec(amount.value) + parseDec(form.shipping_cost);
  form.paid_amount = to2(total);
}, { deep: true, immediate: true });

// Инициализация из props.model
function loadModel(m?: IncomingInvoiceDetail | null) {
  if (!m) {
    // create — ставим текущую дату
    form.date = isoToLocalInput(new Date().toISOString());
    form.accepted = false;
    form.warehouse = null;
    form.supplier = null;
    form.commentary = '';
    form.shipping_cost = '0.00';
    form.paid_amount = '0.00';
    form.invoice_dish_items = [];
    return;
  }
  form.date = isoToLocalInput(m.date);
  form.accepted = !!m.accepted;
  form.warehouse = m.warehouse ?? null;
  form.supplier = m.supplier != null ? Number(m.supplier) : null;
  form.commentary = m.commentary ?? '';
  form.shipping_cost = m.shipping_cost ?? '0.00';
  form.paid_amount = m.paid_amount ?? '0.00';
  // оставляем id/объекты как есть — при сабмите нормализуем в payload
  form.invoice_dish_items = (m.invoice_dish_items ?? []).map(it => ({ ...it }));
}

onMounted(async () => {
  // справочники для селектов
  await Promise.all([
    warehousesStore.fetchRecords(1),
    contractorsStore.fetchRecords(1),
    dishesStore.fetchRecords?.(1) ?? Promise.resolve(), // если есть пагинация — подгрузи
    muStore.fetchRecords?.(1) ?? Promise.resolve(),
  ]);
  loadModel(props.model ?? null);
  await ensureSupplierOption();
});

// Загружаем модель при её появлении/смене и ДОГРУЖАЕМ поставщика по ID
watch(
    () => props.model,
    async (m) => {
      loadModel(m ?? null);
      await ensureSupplierOption();

      // 👇 ключевой момент: если у модели есть supplier, но его нет в опциях — догружаем по ID
      if (form.supplier) {
        const has = contractors.value.some(c => c.id === Number(form.supplier));
        if (!has && contractorsStore.fetchOne) {
          await contractorsStore.fetchOne(Number(form.supplier));
        }
      }
    },
    { immediate: true }
);

// === случай, когда fetchRecords вернулся ПОСЛЕ fetchOne и перезатёр массив ===
watch(
    () => contractors.value.length,
    async () => {
      await ensureSupplierOption(); // ещё раз гарантируем наличие выбранного постащика в списке
    }
);

// ===== Row ops =====
function addItem() {
  if (isReadOnly.value) return;
  form.invoice_dish_items.push({
    dish: undefined as unknown as number, // заставим выбрать
    quantity: '0.00',
    measurement_unit: undefined as unknown as number,
    cost_price: '0.00',
    sale_price: '0.00',
  });
}
function removeItem(idx: number) {
  if (isReadOnly.value) return;
  form.invoice_dish_items.splice(idx, 1);
}

// ===== Submit =====
function buildPayload(): IncomingInvoicePayload {
  return {
    date: localInputToIso(form.date),
    accepted: form.accepted,
    warehouse: Number(form.warehouse),
    supplier: Number(form.supplier),
    commentary: form.commentary ?? '',
    shipping_cost: to2(parseDec(form.shipping_cost)),
    paid_amount: to2(parseDec(form.paid_amount)),
    invoice_dish_items: form.invoice_dish_items.map(it => ({
      id: it.id, // для обновления строк
      dish: typeof it.dish === 'number' ? it.dish : (it.dish as any)?.id,
      measurement_unit: typeof it.measurement_unit === 'number'
          ? it.measurement_unit
          : (it.measurement_unit as any)?.id,
      quantity: to2(parseDec(it.quantity as any)),
      cost_price: to2(parseDec(it.cost_price as any)),
      sale_price: to2(parseDec(it.sale_price as any)),
    })),
  };
}

function onSubmit() {
  if (isReadOnly.value) return;
  if (!form.warehouse || !form.supplier) return; // простая валидация
  emit('submit', buildPayload());
}
</script>

<template>
  <div class="space-y-4">
    <!-- Основные поля -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

<!--      Дата -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">Дата</label>
        <input
            type="datetime-local"
            v-model="form.date"
            :disabled="isReadOnly"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        />
      </div>

<!--      Склад -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">Склад</label>
        <select
            v-model="form.warehouse"
            :disabled="isReadOnly"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        >
          <option :value="null">— Выберите склад —</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </div>

<!--      Поставщик -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">Поставщик</label>
        <select
            v-model="form.supplier"
            id="supplier"
            :disabled="isReadOnly"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        >
          <option :value="null">— Выберите поставщика —</option>
          <option v-for="c in contractors" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

<!--      Проведён-->
      <div class="md:col-span-3">
        <label class="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" v-model="form.accepted" :disabled="isReadOnly" class="rounded border-gray-300" />
          Проведён
        </label>
      </div>

<!--      Комментарий-->
      <div class="md:col-span-3">
        <label class="block text-sm text-gray-600 mb-1">Комментарий</label>
        <textarea
            v-model="form.commentary"
            :disabled="isReadOnly"
            rows="2"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        />
      </div>
    </div>

    <!-- Табличная часть -->
    <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="font-medium">Позиции</div>
        <button
            v-if="!isReadOnly"
            type="button"
            class="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            @click="addItem"
        >
          + Добавить строку
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="px-3 py-2 text-left font-medium">Блюдо</th>
            <th class="px-3 py-2 text-left font-medium">Ед. изм.</th>
            <th class="px-3 py-2 text-right font-medium">Кол-во</th>
            <th class="px-3 py-2 text-right font-medium">Себестоим.</th>
            <th class="px-3 py-2 text-right font-medium">Цена продажи</th>
            <th class="px-3 py-2 text-right font-medium">Сумма</th>
            <th class="px-3 py-2 text-right font-medium"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-if="form.invoice_dish_items.length === 0">
            <td colspan="7" class="px-4 py-6 text-center text-gray-500">
              Строк нет — добавьте первую
            </td>
          </tr>

          <tr v-for="(it, idx) in form.invoice_dish_items" :key="idx" class="border-t">
            <td class="px-3 py-2">
              <select
                  v-model="(it.dish as any)"
                  :disabled="isReadOnly"
                  class="w-56 rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              >
                <option :value="undefined">— Выберите блюдо —</option>
                <option v-for="d in dishes" :key="d.id" :value="d.id">{{ d.name_ru || d.name_kz || d.name_en }}</option>
              </select>
            </td>

            <td class="px-3 py-2">
              <select
                  v-model="(it.measurement_unit as any)"
                  :disabled="isReadOnly"
                  class="w-40 rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              >
                <option :value="undefined">— Ед. изм. —</option>
                <option v-for="u in measurementUnits" :key="u.id" :value="u.id">{{ u.name_ru || u.name_kz || u.name_en }}</option>
              </select>
            </td>

            <td class="px-3 py-2 text-right">
              <input
                  v-model="(it.quantity as any)"
                  :disabled="isReadOnly"
                  type="number" step="0.01" min="0"
                  class="w-28 text-right rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              />
            </td>

            <td class="px-3 py-2 text-right">
              <input
                  v-model="(it.cost_price as any)"
                  :disabled="isReadOnly"
                  type="number" step="0.01" min="0"
                  class="w-28 text-right rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              />
            </td>

            <td class="px-3 py-2 text-right">
              <input
                  v-model="(it.sale_price as any)"
                  :disabled="isReadOnly"
                  type="number" step="0.01" min="0"
                  class="w-28 text-right rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              />
            </td>

            <td class="px-3 py-2 text-right tabular-nums">
              {{ (parseDec(it.quantity as any) * parseDec(it.cost_price as any)).toFixed(2) }}
            </td>

            <td class="px-3 py-2 text-right">
              <button
                  v-if="!isReadOnly"
                  type="button"
                  class="px-2 py-1 text-xs rounded-lg border hover:bg-gray-50"
                  @click="removeItem(idx)"
              >
                Удалить
              </button>
            </td>
          </tr>
          </tbody>

          <tfoot class="border-t bg-gray-50">
          <tr>
            <td colspan="5" class="px-3 py-2 text-right font-medium">Итого по позициям:</td>
            <td class="px-3 py-2 text-right tabular-nums">{{ amount }}</td>
            <td></td>
          </tr>
          <tr>
            <td colspan="5" class="px-3 py-2 text-right font-medium">Доставка:</td>
            <td class="px-3 py-2 text-right">
              <input
                  v-model="form.shipping_cost"
                  :disabled="isReadOnly"
                  type="number" step="0.01" min="0"
                  class="w-28 text-right rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              />
            </td>
            <td></td>
          </tr>
          <tr>
            <td colspan="5" class="px-3 py-2 text-right font-semibold">Итого к оплате:</td>
            <td class="px-3 py-2 text-right font-semibold tabular-nums">{{ form.paid_amount }}</td>
            <td></td>
          </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2" v-if="!isReadOnly">
      <button
          type="button"
          class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          @click="onSubmit"
      >
        Сохранить
      </button>
      <button
          type="button"
          class="px-4 py-2 rounded-lg border hover:bg-gray-50"
          @click="$emit('cancel')"
      >
        Отмена
      </button>
    </div>
  </div>
</template>

<style scoped>
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>
