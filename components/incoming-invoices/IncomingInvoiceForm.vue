<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <!-- Верхняя часть формы (шапка документа) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- КОЛОНКА 1 -->
      <div class="space-y-6">
        <!-- Дата -->
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('date.item') }}</label>
          <input type="datetime-local" v-model="formData.date" :disabled="isViewMode" class="mt-1 block w-full p-2 border rounded-md disabled:bg-gray-100">
        </div>
        <!-- Склад -->
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('warehouse.item') }}</label>
          <select v-model="formData.warehouse" :disabled="isViewMode" class="mt-1 block w-full p-2 border rounded-md disabled:bg-gray-100">
            <option :value="null" disabled>{{ $t('messages.select') }}</option>
            <option v-for="w in warehouseStore.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
        </div>
        <!-- Поставщик -->
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('supplier.item') }}</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input type="text" readonly :value="supplierName" class="p-2 block w-full rounded-none rounded-l-md bg-gray-50" />
            <button v-if="!isViewMode" @click="showContractorDialog = true" type="button" class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100">
              <Search class="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <!-- КОЛОНКА 2 -->
      <div class="space-y-6">
        <!-- Сумма по документу (только просмотр) -->
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('amount') }}</label>
          <input type="number" step="0.01" v-model.number="formData.amount" :disabled="isViewMode" class="mt-1 block w-full p-2 border rounded-md disabled:bg-gray-100">
        </div>
        <!-- Стоимость доставки (редактируемое) -->
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('shipping_cost') }}</label>
          <input type="number" step="0.01" v-model.number="formData.shipping_cost" :disabled="isViewMode" class="mt-1 block w-full p-2 border rounded-md disabled:bg-gray-100">
        </div>
        <!-- Итого к оплате (только просмотр) -->
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('paid_amount') }}</label>
          <input type="number" step="0.01" v-model.number="formData.paid_amount" :disabled="isViewMode" class="mt-1 block w-full p-2 border rounded-md disabled:bg-gray-100">
        </div>
      </div>

      <!-- КОЛОНКА 3 -->
      <div class="space-y-6">
        <!-- Автор (только просмотр) -->
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('author') }}</label>
          <input type="text" :value="formData.author" disabled class="mt-1 block w-full p-2 border rounded-md disabled:bg-gray-100">
        </div>
        <!-- Статус -->
        <div class="pt-7">
          <input type="checkbox" v-model="formData.accepted" id="accepted" :disabled="isViewMode" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:bg-gray-100">
          <label for="accepted" class="ml-2 text-sm text-gray-900">{{ $t('status.accepted') }}</label>
        </div>
      </div>

      <!-- Комментарий -->
      <div class="md:col-span-3">
        <label class="block text-sm font-medium text-gray-700">{{ $t('commentary') }}</label>
        <textarea v-model="formData.commentary" :disabled="isViewMode" rows="2" class="mt-1 block w-full p-2 border rounded-md disabled:bg-gray-100"></textarea>
      </div>
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
          <td class="p-1"><SearchableSelect v-model="item.dish" :store="dishStore" results-key="dishes" :search-field="`name_${locale}`" :display-field="`name_${locale}`" :placeholder="$t('dish.searchPlaceholder')" :disabled="isViewMode" /></td>
          <td class="p-1"><SearchableSelect v-model="item.measurement_unit" :store="measurementUnitsStore" results-key="measurementUnits" :search-field="`name_${locale}`" :display-field="`name_${locale}`" :placeholder="$t('measurementUnit.searchPlaceholder')" :disabled="isViewMode" /></td>
          <td class="p-1"><input type="number" step="0.01" v-model.number="item.quantity" :disabled="isViewMode" class="w-full p-2 border rounded-md disabled:bg-gray-100" /></td>
          <td class="p-1"><input type="number" step="0.01" v-model.number="item.cost_price" :disabled="isViewMode" class="w-full p-2 border rounded-md disabled:bg-gray-100" /></td>
          <td class="p-1"><input type="number" step="0.01" v-model.number="item.sale_price" :disabled="isViewMode" class="w-full p-2 border rounded-md disabled:bg-gray-100" /></td>
          <td v-if="!isViewMode" class="p-1 text-center"><button @click="removeRow(index)" class="text-red-500 hover:text-red-700"><Trash2 class="w-5 h-5" /></button></td>
        </tr>
        </tbody>
      </table>
    </div>
    <button v-if="!isViewMode" @click="addRow" class="mt-4 px-4 py-2 border border-dashed rounded-md text-sm text-indigo-600 hover:bg-indigo-50">
      {{ $t('actions.addRow') }}
    </button>

    <div v-if="!isViewMode" class="flex justify-end space-x-4 mt-8 pt-4 border-t">
      <NuxtLink :to="localePath('/incoming-invoices')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">{{ $t('actions.cancel') }}</NuxtLink>
      <button @click="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{{ $t('actions.save') }}</button>
    </div>

    <ContractorSelectDialog v-model="showContractorDialog" @select="handleContractorSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWarehouseStore } from '~/stores/warehouses';
import { useDishStore } from '~/stores/dishes';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import type { IncomingInvoiceDetail } from '~/stores/incomingInvoices';
import type { Contractor } from '~/stores/contractors';
import SearchableSelect from '~/components/fields/SearchableSelect.vue';
import ContractorSelectDialog from '~/components/dialogs/ContractorSelectDialog.vue';
import { Search, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  initialData?: IncomingInvoiceDetail | null;
  isViewMode?: boolean;
}>();
const emit = defineEmits(['submit']);

const { locale } = useI18n();
const localePath = useLocalePath();
const warehouseStore = useWarehouseStore();
const dishStore = useDishStore();
const measurementUnitsStore = useMeasurementUnitsStore();

const showContractorDialog = ref(false);
const supplierName = ref('');

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

watch(() => props.initialData, (data) => {
  if (data) {
    formData.value = JSON.parse(JSON.stringify(data));
    if (typeof data.supplier === 'object' && data.supplier && 'name' in data.supplier) {
      supplierName.value = (data.supplier as { name: string }).name;
    }
  }
}, { immediate: true, deep: true });

function addRow() {
  formData.value.invoice_dish_items?.push({
    dish: null,
    measurement_unit: null,
    quantity: 1,
    cost_price: 0,
    sale_price: 0,
  });
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
  emit('submit', payload);
}

if (warehouseStore.warehouses.length === 0) {
  warehouseStore.fetchRecords(1);
}
</script>
