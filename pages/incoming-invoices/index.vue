<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useIncomingInvoicesStore } from '~/stores/incomingInvoices';
import { useWarehouseStore } from '~/stores/warehouses';
import { useContractorsStore } from '~/stores/contractors';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const router = useRouter();

// Stores
const invoicesStore = useIncomingInvoicesStore();
const warehousesStore = useWarehouseStore();
const contractorsStore = useContractorsStore();

const {
  invoices,
  isLoading,
  totalRecords,
  pageSize,
  currentPage,
  totalPages,
} = storeToRefs(invoicesStore);

const { warehouses } = storeToRefs(warehousesStore);
const { contractors } = storeToRefs(contractorsStore);

// Фильтры (supplier, warehouse)
const supplierId = ref<number | null>(null);
const warehouseId = ref<number | null>(null);

function applyFilters() {
  invoicesStore.searchQuery.supplier = supplierId.value;
  invoicesStore.searchQuery.warehouse = warehouseId.value;
  invoicesStore.fetchRecords(1);
}

function resetFilters() {
  supplierId.value = null;
  warehouseId.value = null;

  invoicesStore.searchQuery.supplier = null;
  invoicesStore.searchQuery.warehouse = null;
  invoicesStore.fetchRecords(1);
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  invoicesStore.fetchRecords(page);
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU');
  } catch {
    return iso;
  }
}

onMounted(async () => {
  // Подтягиваем справочники (для селектов) и первый список накладных
  await Promise.all([
    warehousesStore.fetchRecords(1),
    contractorsStore.fetchRecords(1),
  ]);
  await invoicesStore.fetchRecords(1);
});
</script>

<template>
  <div class="p-4 lg:p-6 space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 class="text-xl font-semibold">Приходные накладные</h1>

      <div class="flex items-center gap-2">
        <NuxtLink
            to="/incoming-invoices/create"
            class="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
        >
          Создать накладную
        </NuxtLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white rounded-xl p-4 shadow-sm border">
      <div class="md:col-span-1">
        <label class="block text-sm text-gray-600 mb-1">Поставщик</label>
        <select
            v-model="supplierId"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        >
          <option :value="null">— Все —</option>
          <option v-for="c in contractors" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>

      <div class="md:col-span-1">
        <label class="block text-sm text-gray-600 mb-1">Склад</label>
        <select
            v-model="warehouseId"
            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        >
          <option :value="null">— Все —</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">
            {{ w.name }}
          </option>
        </select>
      </div>

      <div class="md:col-span-2 flex items-end gap-2">
        <button
            type="button"
            @click="applyFilters"
            class="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
        >
          Применить
        </button>
        <button
            type="button"
            @click="resetFilters"
            class="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition"
        >
          Сбросить
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="px-4 py-3 text-left font-medium">Дата</th>
            <th class="px-4 py-3 text-left font-medium">Статус</th>
            <th class="px-4 py-3 text-left font-medium">Склад</th>
            <th class="px-4 py-3 text-left font-medium">Поставщик</th>
            <th class="px-4 py-3 text-left font-medium">Комментарий</th>
            <th class="px-4 py-3 text-right font-medium">Сумма</th>
            <th class="px-4 py-3 text-right font-medium">Доставка</th>
            <th class="px-4 py-3 text-right font-medium">Оплачено</th>
            <th class="px-4 py-3 text-right font-medium">Действия</th>
          </tr>
          </thead>
          <tbody>
          <tr v-if="isLoading">
            <td colspan="9" class="px-4 py-6 text-center text-gray-500">
              Загрузка…
            </td>
          </tr>
          <tr
              v-for="row in invoices"
              :key="row.id"
              class="border-t"
          >
            <td class="px-4 py-3">{{ fmtDate(row.date) }}</td>
            <td class="px-4 py-3">
                <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="row.accepted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                >
                  {{ row.accepted ? 'Проведён' : 'Черновик' }}
                </span>
            </td>
            <td class="px-4 py-3">{{ row.warehouse?.name }}</td>
            <td class="px-4 py-3">{{ row.supplier?.name }}</td>
            <td class="px-4 py-3">
              <span class="line-clamp-2">{{ row.commentary }}</span>
            </td>
            <td class="px-4 py-3 text-right tabular-nums">{{ row.amount }}</td>
            <td class="px-4 py-3 text-right tabular-nums">{{ row.shipping_cost }}</td>
            <td class="px-4 py-3 text-right tabular-nums">{{ row.paid_amount }}</td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-2">
                <NuxtLink
                    :to="`/incoming-invoices/${row.id}`"
                    class="text-gray-700 hover:text-gray-900 underline underline-offset-2"
                    title="Открыть"
                >
                  Откр.
                </NuxtLink>
                <NuxtLink
                    :to="`/incoming-invoices/${row.id}/edit`"
                    class="text-gray-700 hover:text-gray-900 underline underline-offset-2"
                    title="Редактировать"
                >
                  Ред.
                </NuxtLink>
              </div>
            </td>
          </tr>

          <tr v-if="!isLoading && invoices.length === 0">
            <td colspan="9" class="px-4 py-6 text-center text-gray-500">
              Ничего не найдено
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t px-4 py-3 text-sm">
        <div class="text-gray-600">
          Всего: <span class="font-medium">{{ totalRecords }}</span>
        </div>

        <div class="flex items-center gap-1">
          <button
              class="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              :disabled="currentPage <= 1"
              @click="changePage(currentPage - 1)"
          >
            Назад
          </button>
          <span class="px-2">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
              class="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              :disabled="currentPage >= totalPages"
              @click="changePage(currentPage + 1)"
          >
            Вперёд
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>
