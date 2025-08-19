<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <!-- Динамический заголовок -->
    <h1 class="text-2xl font-bold mb-6 border-b pb-4">{{ formTitle }}</h1>

    <!-- Верхняя часть формы -->
    <div class="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-4 mb-8">
      <!-- СТРОКА 1 -->
      <div class="md:col-span-3">
        <label class="block text-sm font-medium text-gray-700">{{ $t('student.refName') }}</label>
        <div class="mt-1 flex rounded-md shadow-sm">
          <input type="text" readonly :value="studentName" class="h-10 px-2 block w-full border border-r-0 border-gray-300 rounded-none rounded-l-md bg-gray-50" />
          <button v-if="!isViewMode" @click="showStudentDialog = true" type="button" class="h-10 -ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100">
            <Search class="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
      <div class="md:col-span-3">
        <label class="block text-sm font-medium text-gray-700">{{ $t('warehouse.refName') }}</label>
        <select v-model="formData.warehouse" :disabled="isViewMode" class="mt-1 block w-full h-10 px-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
          <option :value="null" disabled>{{ $t('messages.select') }}</option>
          <option v-for="w in warehouseStore.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </div>
    </div>

    <!-- СТРОКА 2 -->
    <div class="grid grid-cols-1 md:grid-cols-8 gap-x-6 gap-y-4 mb-8">
      <!-- ИЗМЕНЕНИЕ: Поле Amount теперь disabled и привязано к formData.amount -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{ $t('numbers.amount') }}</label>
        <input type="number" step="0.01" :value="formData.amount" disabled class="mt-1 block w-full h-10 px-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
      </div>
      <!-- ИЗМЕНЕНИЕ: Поле Paid Amount теперь редактируемое -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{ $t('numbers.paid_amount') }}</label>
        <input type="number" step="0.01" v-model.number="formData.paid_amount" :disabled="isViewMode" class="mt-1 block w-full h-10 px-2 border border-gray-300 rounded-md shadow-sm">
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{ $t('sellingDish.payment_method') }}</label>
        <select v-model="formData.payment_method" :disabled="isViewMode" class="mt-1 block w-full h-10 px-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
          <option :value="null" disabled>{{ $t('messages.select') }}</option>
          <option v-for="method in paymentMethods" :key="method.value" :value="method.value">
            {{ locale === 'kz' ? method.kz : method.ru }}
          </option>
        </select>
      </div>
      <div class="md:col-span-2 flex items-end pb-2">
        <input type="checkbox" v-model="formData.accepted" id="accepted" :disabled="isViewMode" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:bg-gray-100">
        <label for="accepted" class="ml-2 text-sm text-gray-900">{{ $t('docs.accepted') }}</label>
      </div>
    </div>

    <!-- Табличная часть -->
    <DocumentItemsTable
        :items="formData.selling_dish_items"
        :title="$t('dish.itemList')"
        :add-row-text="$t('actions.addRow')"
        :is-view-mode="isViewMode"
        @add-row="addRow"
        @remove-row="removeRow"
    >
      <template #head>
        <th class="w-2/6 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('dish.refName') }}</th>
        <th class="w-1/6 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('measurementUnit.refName') }}</th>
        <th class="w-1/6 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('numbers.quantity') }}</th>
        <th class="w-1/6 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('numbers.salePrice') }}</th>
        <th class="w-1/6 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('numbers.amount') }}</th>
      </template>
      <template #row="{ item, index }">
        <td class="p-1">
          <SearchableSelect
              :ref="el => { if (el) dishSelectRefs[index] = el }"
              v-model="item.dish"
              :store="dishStore"
              results-key="dishes"
              :search-field="`name_${locale}`"
              :display-field="`name_${locale}`"
              :disabled="isViewMode"
          />
        </td>
        <td class="p-1"><SearchableSelect v-model="item.measurement_unit" :store="measurementUnitsStore" results-key="measurementUnits" :search-field="`name_${locale}`" :display-field="`name_${locale}`" :disabled="isViewMode" /></td>
        <td class="p-1"><input type="number" step="0.01" v-model.number="item.quantity" :disabled="isViewMode" class="w-full p-2 border rounded-md shadow-sm disabled:bg-gray-100" /></td>
        <td class="p-1"><input type="number" step="0.01" v-model.number="item.sale_price" @keydown.enter.prevent="addRow" :disabled="isViewMode" class="w-full p-2 border rounded-md shadow-sm disabled:bg-gray-100" /></td>
        <td class="p-1"><input type="number" step="0.01" :value="item.amount" disabled class="w-full p-2 border rounded-md shadow-sm bg-gray-100" /></td>
      </template>
    </DocumentItemsTable>

    <!-- Комментарий и кнопки -->
    <div class="mt-6">
      <label class="block text-sm font-medium text-gray-700">{{ $t('docs.commentary') }}</label>
      <textarea v-model="formData.commentary" :disabled="isViewMode" rows="3" class="mt-1 block w-full p-2 border rounded-md shadow-sm disabled:bg-gray-100"></textarea>
    </div>
    <div class="flex justify-between items-center mt-8 pt-4 border-t">
      <div class="text-sm text-gray-500">
        <span v-if="formData.author">{{ $t('docs.author') }}: {{ formData.author }}</span>
      </div>
      <div v-if="!isViewMode" class="flex space-x-4">
        <NuxtLink :to="localePath('/selling-dishes')" :class="['px-4 py-2 rounded-md', isSubmitting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400']">{{ $t('actions.cancel') }}</NuxtLink>
        <button @click="submit" :disabled="isSubmitting" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait flex items-center">
          <BaseSpinner v-if="isSubmitting" class="w-5 h-5 mr-2" />
          {{ isSubmitting ? $t('actions.saving') : $t('actions.save') }}
        </button>
      </div>
    </div>

    <StudentSelectDialog v-model="showStudentDialog" @select="handleStudentSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWarehouseStore } from '~/stores/warehouses';
import { useDishStore } from '~/stores/dishes';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import { useStudentsStore, type Student } from '~/stores/students';
import type { SellingDishDetailRich, SellingDishPayload } from '~/types/documents';
import DocumentItemsTable from '~/components/documents/DocumentItemsTable.vue';
import SearchableSelect from '~/components/fields/SearchableSelect.vue';
import StudentSelectDialog from '~/components/dialogs/StudentSelectDialog.vue';
import { Search, Trash2 } from 'lucide-vue-next';
import BaseSpinner from '~/components/BaseSpinner.vue';

const props = defineProps<{
  initialData?: SellingDishDetailRich | null;
  isViewMode?: boolean;
  isSubmitting?: boolean;
}>();
const emit = defineEmits(['submit']);

const { t, locale } = useI18n();
const localePath = useLocalePath();
const warehouseStore = useWarehouseStore();
const dishStore = useDishStore();
const measurementUnitsStore = useMeasurementUnitsStore();
const studentsStore = useStudentsStore();

const paymentMethods = [
  { value: 'QR', ru: 'Оплата по QR', kz: 'QR бойынша төлем' },
  { value: 'CD', ru: 'Оплата картой', kz: 'Картамен төлеу' },
  { value: 'CH', ru: 'Наличка', kz: 'Қолма-қол ақша' }
];

const showStudentDialog = ref(false);
const studentName = ref('');
const dishSelectRefs = ref([]);

const formData = ref<Partial<SellingDishDetailRich>>({
  date: new Date().toISOString().slice(0, 16),
  accepted: true,
  warehouse: null,
  student: null,
  commentary: '',
  payment_method: 'QR',
  selling_dish_items: [],
  amount: 0,
  paid_amount: 0, // Инициализируем
});

// --- ИЗМЕНЕНИЕ: Убран computed, так как `amount` теперь в state ---
// const totalAmount = computed(() => ...);

// --- ИЗМЕНЕНИЕ: Улучшенная логика в watch ---
watch(formData, async (newData) => {
  let newTotalAmount = 0;
  const items = newData.selling_dish_items || [];

  for (const item of items) {
    // 1. Автозаполнение цены и ед. измерения
    if (typeof item.dish === 'object' && item.dish) {
      const selectedDish = item.dish as { measurement_unit?: number | null, id: number, price: number };
      const currentUnit = item.measurement_unit;
      const currentUnitId = (typeof currentUnit === 'object' && currentUnit) ? currentUnit.id : currentUnit;

      if (selectedDish.price && item.sale_price !== selectedDish.price) {
        item.sale_price = selectedDish.price;
      }
      if (selectedDish.measurement_unit && selectedDish.measurement_unit !== currentUnitId) {
        if (measurementUnitsStore.measurementUnits.length === 0) {
          await measurementUnitsStore.fetchRecords(1);
        }
        const defaultUnit = measurementUnitsStore.measurementUnits.find(u => u.id === selectedDish.measurement_unit);
        if (defaultUnit) item.measurement_unit = { ...defaultUnit };
      }
    }

    // 2. Пересчет суммы строки
    const quantity = Number(item.quantity) || 0;
    const salePrice = Number(item.sale_price) || 0;
    const newAmount = parseFloat((quantity * salePrice).toFixed(2));
    if (item.amount !== newAmount) {
      item.amount = newAmount;
    }

    // 3. Суммируем для итоговой суммы
    newTotalAmount += item.amount;
  }

  // 4. Обновляем итоговую сумму в formData
  const finalTotalAmount = parseFloat(newTotalAmount.toFixed(2));
  if (newData.amount !== finalTotalAmount) {
    formData.value.amount = finalTotalAmount;
  }

}, { deep: true });
// --- КОНЕЦ ИЗМЕНЕНИЯ ---

watch(() => props.initialData, (data) => {
  if (data) {
    const tempData = JSON.parse(JSON.stringify(data));
    if (typeof tempData.student === 'object' && tempData.student) {
      studentName.value = tempData.student.full_name;
      tempData.student = tempData.student.id;
    }
    if (typeof tempData.warehouse === 'object' && tempData.warehouse) {
      tempData.warehouse = tempData.warehouse.id;
    }
    formData.value = tempData;
  }
}, { immediate: true, deep: true });

const formatDateForTitle = (isoDate: string) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  };
  return new Intl.DateTimeFormat(locale.value === 'kz' ? 'kk-KZ' : 'ru-RU', options).format(date);
};

const formatNumberForTitle = (num: number) => {
  return new Intl.NumberFormat(locale.value === 'kz' ? 'kk-KZ' : 'ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0);
};

const formTitle = computed(() => {
  if (!props.initialData) return t('sellingDish.creating');
  const formattedDate = formatDateForTitle(formData.value.date || '');
  const formattedAmount = formatNumberForTitle(formData.value.amount || 0); // Используем formData.amount
  if (locale.value === 'kz') {
    return `${formattedDate} жылғы ${formattedAmount} тг. сомасына тағам сату`;
  }
  return `Продажа блюд от ${formattedDate} на сумму ${formattedAmount} тг.`;
});

async function addRow() {
  if (props.isViewMode) return;
  formData.value.selling_dish_items?.push({
    dish: null,
    measurement_unit: null,
    quantity: 1,
    sale_price: 0,
    amount: 0,
  });
  await nextTick();
  dishSelectRefs.value.at(-1)?.focus();
}

function removeRow(index: number) {
  formData.value.selling_dish_items?.splice(index, 1);
}

function handleStudentSelect(student: Student) {
  formData.value.student = student.id;
  studentName.value = student.full_name;
}

function submit() {
  const payload = JSON.parse(JSON.stringify(formData.value));
  payload.selling_dish_items = payload.selling_dish_items.map(item => ({
    ...item,
    dish: typeof item.dish === 'object' && item.dish ? item.dish.id : item.dish,
    measurement_unit: typeof item.measurement_unit === 'object' && item.measurement_unit ? item.measurement_unit.id : item.measurement_unit,
  }));
  // ИЗМЕНЕНИЕ: paid_amount теперь берется из formData, а не рассчитывается
  emit('submit', payload);
}

function handleGlobalKeyDown(event: KeyboardEvent) {
  if (event.key === 'Insert' && !props.isViewMode) {
    event.preventDefault();
    addRow();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown);
  if (warehouseStore.warehouses.length === 0) warehouseStore.fetchRecords(1);
  if (measurementUnitsStore.measurementUnits.length === 0) measurementUnitsStore.fetchRecords(1);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>
