<template>
  <div class="bg-white p-6 rounded-lg shadow-md" @keydown.insert.prevent="addRow">
    <!-- Верхняя часть формы (шапка документа) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-8">

      <!-- СТРОКА 1 -->
      <!-- date.item -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ $t('date.item') }}</label>
        <input type="datetime-local" v-model="formData.date" :disabled="isViewMode" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
      </div>
      <!-- amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ $t('amount') }}</label>
        <input type="number" step="0.01" :value="totalAmount" disabled class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
      </div>
      <!-- status.accepted -->
      <div class="flex items-end pb-2">
        <input type="checkbox" v-model="formData.accepted" id="accepted" :disabled="isViewMode" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:bg-gray-100">
        <label for="accepted" class="ml-2 text-sm text-gray-900">{{ $t('status.accepted') }}</label>
      </div>

      <!-- СТРОКА 2 -->
      <!-- supplier.item -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ $t('supplier.item') }}</label>
        <div class="mt-1 flex rounded-md shadow-sm">
          <input type="text" readonly :value="supplierName" class="p-2 block w-full border border-r-0 border-gray-300 rounded-none rounded-l-md bg-gray-50" />
          <button v-if="!isViewMode" @click="showContractorDialog = true" type="button" class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100">
            <Search class="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
      <!-- warehouse.item -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ $t('warehouse.item') }}</label>
        <select v-model="formData.warehouse" :disabled="isViewMode" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
          <option :value="null" disabled>{{ $t('messages.select') }}</option>
          <option v-for="w in warehouseStore.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </div>
      <!-- author -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ $t('author') }}</label>
        <input type="text" :value="formData.author" disabled class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
      </div>

      <!-- СТРОКА 3 -->
      <!-- shipping_cost -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ $t('shipping_cost') }}</label>
        <input type="number" step="0.01" v-model.number="formData.shipping_cost" :disabled="isViewMode" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
      </div>
      <!-- paid_amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700">{{ $t('paid_amount') }}</label>
        <input type="number" step="0.01" :value="finalAmount" disabled class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
      </div>
      <!-- Пустое место -->
      <div></div>

    </div>

    <!-- Табличная часть -->
    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('invoiceItems') }}</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
        <tr>
          <th class="w-2/5 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('dish.item') }}</th>
          <th class="w-1/5 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('measurementUnit.item') }}</th>
          <th class="w-1/5 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('quantity') }}</th>
          <th class="w-1/5 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('costPrice') }}</th>
          <th class="w-1/5 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('salePrice') }}</th>
          <th v-if="!isViewMode" class="w-auto px-2 py-2"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in formData.invoice_dish_items" :key="index">
          <td class="p-1">
            <SearchableSelect
                :ref="el => { if (el) dishSelectRefs[index] = el }"
                v-model="item.dish"
                :store="dishStore"
                results-key="dishes"
                :search-field="`name_${locale}`"
                :display-field="`name_${locale}`"
                :placeholder="$t('dish.searchPlaceholder')"
                :disabled="isViewMode"
            />
          </td>
          <td class="p-1"><SearchableSelect v-model="item.measurement_unit" :store="measurementUnitsStore" results-key="measurementUnits" :search-field="`name_${locale}`" :display-field="`name_${locale}`" :placeholder="$t('measurementUnit.searchPlaceholder')" :disabled="isViewMode" /></td>
          <td class="p-1"><input type="number" step="0.01" v-model.number="item.quantity" :disabled="isViewMode" class="w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" /></td>
          <td class="p-1"><input type="number" step="0.01" v-model.number="item.cost_price" @keydown.enter.prevent="addRow" :disabled="isViewMode" class="w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" /></td>
          <td class="p-1"><input type="number" step="0.01" :value="item.sale_price" disabled class="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100" /></td>
          <td v-if="!isViewMode" class="p-1 text-center"><button @click="removeRow(index)" class="text-red-500 hover:text-red-700"><Trash2 class="w-5 h-5" /></button></td>
        </tr>
        </tbody>
      </table>
    </div>
    <button v-if="!isViewMode" @click="addRow" class="mt-4 px-4 py-2 border border-dashed rounded-md text-sm text-indigo-600 hover:bg-indigo-50">
      {{ $t('actions.addRow') }} (Insert)
    </button>

    <!-- Комментарий -->
    <div class="mt-6">
      <label class="block text-sm font-medium text-gray-700">{{ $t('commentary') }}</label>
      <textarea v-model="formData.commentary" :disabled="isViewMode" rows="3" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"></textarea>
    </div>

    <!-- Кнопки управления -->
    <div v-if="!isViewMode" class="flex justify-end space-x-4 mt-8 pt-4 border-t">
      <NuxtLink :to="localePath('/incoming-invoices')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">{{ $t('actions.cancel') }}</NuxtLink>
      <button @click="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{{ $t('actions.save') }}</button>
    </div>

    <ContractorSelectDialog v-model="showContractorDialog" @select="handleContractorSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWarehouseStore } from '~/stores/warehouses';
import { useDishStore } from '~/stores/dishes';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import type { IncomingInvoiceDetail } from '~/stores/incomingInvoices';
import type { Contractor } from '~/stores/contractors';
import SearchableSelect from '~/components/fields/SearchableSelect.vue';
import ContractorSelectDialog from '~/components/dialogs/ContractorSelectDialog.vue';
import { Search, Trash2 } from 'lucide-vue-next';

// --- Props & Emits ---
const props = defineProps<{
  initialData?: IncomingInvoiceDetail | null;
  isViewMode?: boolean;
}>();
const emit = defineEmits(['submit']);

// --- Stores & Composables ---
const { locale } = useI18n();
const localePath = useLocalePath();
const warehouseStore = useWarehouseStore();
const dishStore = useDishStore();
const measurementUnitsStore = useMeasurementUnitsStore();

// --- State ---
const showContractorDialog = ref(false);
const supplierName = ref('');
const dishSelectRefs = ref([]);

const formData = ref<Partial<IncomingInvoiceDetail>>({
  date: new Date().toISOString().slice(0, 16),
  accepted: true,
  warehouse: null,
  supplier: null,
  commentary: '',
  shipping_cost: 0,
  invoice_dish_items: [],
  amount: 0,
  paid_amount: 0,
  author: '',
});

// --- Computed Properties ---
const totalAmount = computed(() => {
  return formData.value.invoice_dish_items?.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.cost_price) || 0);
  }, 0) || 0;
});

const finalAmount = computed(() => {
  return totalAmount.value + (Number(formData.value.shipping_cost) || 0);
});

// --- Watchers ---
watch(() => formData.value.invoice_dish_items, (items) => {
  items?.forEach(item => {
    const quantity = Number(item.quantity) || 0;
    const costPrice = Number(item.cost_price) || 0;
    item.sale_price = parseFloat((quantity * costPrice).toFixed(2));
  });
}, { deep: true });

watch(() => props.initialData, (data) => {
  if (data) {
    formData.value = JSON.parse(JSON.stringify(data));
    if (typeof data.supplier === 'object' && data.supplier && 'name' in data.supplier) {
      supplierName.value = (data.supplier as { name: string }).name;
    }
  }
}, { immediate: true, deep: true });

// --- Methods ---
async function addRow() {
  if (props.isViewMode) return;
  formData.value.invoice_dish_items?.push({
    dish: null,
    measurement_unit: null,
    quantity: 1,
    cost_price: 0,
    sale_price: 0,
  });

  await nextTick();

  const lastIndex = (formData.value.invoice_dish_items?.length || 0) - 1;
  if (lastIndex >= 0) {
    const lastDishSelect = dishSelectRefs.value[lastIndex];
    if (lastDishSelect && typeof lastDishSelect.focus === 'function') {
      lastDishSelect.focus();
    }
  }
}

function removeRow(index: number) {
  formData.value.invoice_dish_items?.splice(index, 1);
}

function handleContractorSelect(contractor: Contractor) {
  formData.value.supplier = contractor.id;
  supplierName.value = contractor.name;
}

function submit() {
  const payload = JSON.parse(JSON.stringify(formData.value));
  payload.invoice_dish_items = payload.invoice_dish_items.map(item => ({
    ...item,
    dish: typeof item.dish === 'object' && item.dish !== null ? item.dish.id : item.dish,
    measurement_unit: typeof item.measurement_unit === 'object' && item.measurement_unit !== null ? item.measurement_unit.id : item.measurement_unit,
  }));
  payload.amount = totalAmount.value;
  payload.paid_amount = finalAmount.value;
  emit('submit', payload);
}

// --- Lifecycle & Global Events ---
function handleGlobalKeyDown(event: KeyboardEvent) {
  if (event.key === 'Insert' && !props.isViewMode) {
    event.preventDefault();
    addRow();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown);
  if (warehouseStore.warehouses.length === 0) {
    warehouseStore.fetchRecords(1);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>
