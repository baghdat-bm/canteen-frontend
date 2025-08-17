<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <!-- Динамический заголовок -->
    <h1 class="text-2xl font-bold mb-6 border-b pb-4">{{ formTitle }}</h1>

    <!-- Верхняя часть формы (шапка документа) -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-4 mb-8">

      <!-- СТРОКА 1 (3 колонки) -->
      <!-- warehouse.item -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{ $t('warehouse.refName') }}</label>
        <select v-model="formData.warehouse" :disabled="isViewMode" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
          <option :value="null" disabled>{{ $t('messages.select') }}</option>
          <option v-for="w in warehouseStore.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </div>
      <!-- writing_off_reason.item -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">{{ $t('writingOffReason.refName') }}</label>
        <select v-model="formData.writing_off_reason" :disabled="isViewMode" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
          <option :value="null" disabled>{{ $t('messages.select') }}</option>
          <option v-for="w in writingOffReasonsStore.writingOffReasons" :key="w.id" :value="w.id">
            {{ locale === 'kz' ? w.name_kz : w.name_ru }}
          </option>
        </select>
      </div>

      <!-- status.accepted -->
      <div class="md:col-span-1 flex items-end pb-2">
        <input type="checkbox" v-model="formData.accepted" id="accepted" :disabled="isViewMode" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:bg-gray-100">
        <label for="accepted" class="ml-2 text-sm text-gray-900">{{ $t('docs.accepted') }}</label>
      </div>

    </div>

    <!-- Табличная часть -->
    <DocumentItemsTable
        :items="formData.write_off_dish_items"
        :title="$t('dish.itemList')"
        :add-row-text="$t('actions.addRow')"
        :is-view-mode="isViewMode"
        @add-row="addRow"
        @remove-row="removeRow"
    >
      <template #head>
        <th class="w-3/5 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('dish.refName') }}</th>
        <th class="w-1/5 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('measurementUnit.refName') }}</th>
        <th class="w-1/5 px-2 py-2 text-left text-sm font-semibold text-gray-600">{{ $t('numbers.quantity') }}</th>
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
              :placeholder="$t('dish.searchPlaceholder')"
              :disabled="isViewMode"
          />
        </td>
        <td class="p-1"><SearchableSelect v-model="item.measurement_unit" :store="measurementUnitsStore" results-key="measurementUnits" :search-field="`name_${locale}`" :display-field="`name_${locale}`" :placeholder="$t('measurementUnit.searchPlaceholder')" :disabled="isViewMode" /></td>
        <td class="p-1"><input :ref="el => { if (el) quantityRefs[index] = el }" type="number" step="0.01" @keydown.enter.prevent="addRow" v-model.number="item.quantity" :disabled="isViewMode" class="w-full p-2 border border-gray-400 rounded-md shadow-sm disabled:bg-gray-100" /></td>
      </template>
    </DocumentItemsTable>

    <!-- Комментарий -->
    <div class="mt-6">
      <label class="block text-sm font-medium text-gray-700">{{ $t('docs.commentary') }}</label>
      <textarea v-model="formData.commentary" :disabled="isViewMode" rows="3" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"></textarea>
    </div>

    <!-- Кнопки управления -->
    <div class="flex justify-between items-center mt-8 pt-4 border-t">
      <div class="text-sm text-gray-500">
        <span v-if="formData.author">{{ $t('docs.author') }}: {{ formData.author }}</span>
      </div>
      <div v-if="!isViewMode" class="flex space-x-4">
        <NuxtLink
            :to="localePath('/write-offs')"
            :class="['px-4 py-2 rounded-md', isSubmitting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400']"
            :aria-disabled="isSubmitting"
            :tabindex="isSubmitting ? -1 : undefined"
            @click="isSubmitting ? $event.preventDefault() : null"
        >
          {{ $t('actions.cancel') }}
        </NuxtLink>
        <button
            @click="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait flex items-center"
        >
          <BaseSpinner v-if="isSubmitting" class="w-5 h-5 mr-2" />
          {{ isSubmitting ? $t('actions.saving') : $t('actions.save') }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUiStore } from '~/stores/ui';
import { useWarehouseStore } from '~/stores/warehouses';
import { useDishStore } from '~/stores/dishes';
import { useMeasurementUnitsStore } from '~/stores/measurementUnits';
import { useWritingOffReasonsStore } from '~/stores/writingOffReasons'
import type { WriteOffDetailRich } from '~/types/documents';
import SearchableSelect from '~/components/fields/SearchableSelect.vue';
import BaseSpinner from '~/components/BaseSpinner.vue';
import DocumentItemsTable from '~/components/documents/DocumentItemsTable.vue'

const props = defineProps<{
  initialData?: WriteOffDetailRich | null;
  isViewMode?: boolean;
  isSubmitting?: boolean;
}>();
const emit = defineEmits(['submit']);

const { t, locale } = useI18n();
const localePath = useLocalePath();
const uiStore = useUiStore();
const warehouseStore = useWarehouseStore();
const dishStore = useDishStore();
const measurementUnitsStore = useMeasurementUnitsStore();
const writingOffReasonsStore = useWritingOffReasonsStore();

const dishSelectRefs = ref([]);
const quantityRefs = ref([]);

let barcodeBuffer = '';
let lastKeystrokeTime = 0;

const formData = ref<Partial<WriteOffDetailRich>>({
  date: new Date().toISOString().slice(0, 16),
  accepted: true,
  warehouse: null,
  writing_off_reason: null,
  commentary: '',
  author: '',
  write_off_dish_items: [],
});


watch(formData, async (newData) => {
  const items = newData.write_off_dish_items || [];

  for (const item of items) {
    if (typeof item.dish === 'object' && item.dish) {
      const selectedDish = item.dish as { measurement_unit?: number | null, id: number };
      const currentUnit = item.measurement_unit;
      const currentUnitId = (typeof currentUnit === 'object' && currentUnit) ? currentUnit.id : currentUnit;

      if (selectedDish.measurement_unit && selectedDish.measurement_unit !== currentUnitId) {
        if (measurementUnitsStore.measurementUnits.length === 0) {
          await measurementUnitsStore.fetchRecords(1);
        }

        const defaultUnit = measurementUnitsStore.measurementUnits.find(
            unit => unit.id === selectedDish.measurement_unit
        );

        if (defaultUnit) {
          item.measurement_unit = { ...defaultUnit };
        }
      }
    }
  }
}, { deep: true });

watch(() => props.initialData, (data) => {
  if (data) {
    const tempData = JSON.parse(JSON.stringify(data));

    if (typeof tempData.warehouse === 'object' && tempData.warehouse !== null) {
      tempData.warehouse = tempData.warehouse.id;
    }

    if (typeof tempData.writing_off_reason === 'object' && tempData.writing_off_reason !== null) {
      tempData.writing_off_reason = tempData.writing_off_reason.id;
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
  if (!props.initialData) {
    return t('writeOff.creating');
  }

  const formattedDate = formatDateForTitle(formData.value.date || '');

  if (locale.value === 'kz') {
    return `${formattedDate} жылғы қойма есебінен шығару`;
  }
  return `Списание со склада от ${formattedDate}`;
});

async function addRow() {
  if (props.isViewMode) return;
  formData.value.write_off_dish_items?.push({
    item: null,
    measurement_unit: null,
    quantity: 1,
  });

  await nextTick();

  const lastIndex = (formData.value.write_off_dish_items?.length || 0) - 1;
  if (lastIndex >= 0) {
    const lastDishSelect = dishSelectRefs.value[lastIndex];
    if (lastDishSelect && typeof lastDishSelect.focus === 'function') {
      lastDishSelect.focus();
    }
  }
}

function removeRow(index: number) {
  formData.value.write_off_dish_items?.splice(index, 1);
}

function submit() {
  const payload = JSON.parse(JSON.stringify(formData.value));
  payload.write_off_dish_items = payload.write_off_dish_items.map(item => ({
    ...item,
    dish: typeof item.dish === 'object' && item.dish !== null ? item.dish.id : item.dish,
    measurement_unit: typeof item.measurement_unit === 'object' && item.measurement_unit !== null ? item.measurement_unit.id : item.measurement_unit,
  }));
  emit('submit', payload);
}

async function handleBarcodeScan(barcode: string) {
  if (props.isViewMode) return;

  dishStore.searchQuery.barcode = barcode;
  await dishStore.fetchRecords(1);
  dishStore.searchQuery.barcode = '';

  const foundDish = dishStore.dishes[0];

  if (foundDish) {
    await addRow();
    const lastIndex = (formData.value.write_off_dish_items?.length || 0) - 1;
    if (lastIndex >= 0) {
      formData.value.write_off_dish_items[lastIndex].item = foundDish;
      await nextTick();
      quantityRefs.value[lastIndex]?.focus();
    }
  } else {
    uiStore.showNotification({
      message: t('messages.barcodeNotFound', { barcode }),
      type: 'warning',
    });
  }
}

function handleGlobalKeyDown(event: KeyboardEvent) {
  if (props.isViewMode) return;

  if (event.key === 'Insert') {
    event.preventDefault();
    addRow();
    return;
  }

  const currentTime = Date.now();
  if (currentTime - lastKeystrokeTime > 100) {
    barcodeBuffer = '';
  }

  if (event.key === 'Enter') {
    if (barcodeBuffer.length > 2) {
      event.preventDefault();
      handleBarcodeScan(barcodeBuffer);
    }
    barcodeBuffer = '';
  } else if (event.key.length === 1) {
    barcodeBuffer += event.key;
  }

  lastKeystrokeTime = currentTime;
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown);
  if (warehouseStore.warehouses.length === 0) {
    warehouseStore.fetchRecords(1);
  }
  if (measurementUnitsStore.measurementUnits.length === 0) {
    measurementUnitsStore.fetchRecords(1);
  }
  if (writingOffReasonsStore.writingOffReasons.length === 0) {
    writingOffReasonsStore.fetchRecords(1);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>
