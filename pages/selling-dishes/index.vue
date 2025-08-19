<template>
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-bold">{{ $t('sellingDish.itemList') }}</h1>
      <NuxtLink :to="localePath('/selling-dishes/create')" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>

    <div class="p-4 bg-white rounded-lg shadow mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DateRangePicker v-model="localSearchQuery.dates" />
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('warehouse.refName') }}</label>
          <select v-model="localSearchQuery.warehouse" class="mt-1 block w-full h-10 px-2 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm">
            <option :value="null">{{ $t('all') }}</option>
            <option v-for="warehouse in warehouseStore.warehouses" :key="warehouse.id" :value="warehouse.id">{{ warehouse.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('student.refName') }}</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input type="text" readonly :value="selectedStudentName" class="h-10 px-2 block w-full border border-gray-300 rounded-none rounded-l-md bg-gray-50" />
            <button @click="clearStudent" v-if="localSearchQuery.student" type="button" class="h-10 -ml-px relative inline-flex items-center px-3 border border-gray-300 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100">
              <X class="h-5 w-5 text-gray-400" />
            </button>
            <button @click="showStudentDialog = true" type="button" class="h-10 -ml-px relative inline-flex items-center px-4 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100">
              <SquareMousePointer class="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex justify-end space-x-2 mt-4 pt-4 border-t">
        <button @click="handleReset" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">{{ $t('search.reset') }}</button>
        <button @click="handleSearch" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{{ $t('search.find') }}</button>
      </div>
    </div>

    <div v-if="store.isLoading" class="bg-white rounded-lg shadow p-8 text-center"><BaseSpinner /></div>
    <div v-else-if="!store.list || store.list.length === 0" class="text-center text-gray-500 bg-white rounded-lg shadow p-8">{{ $t('messages.noData') }}</div>

    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
        <tr>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('date.item') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('student.refName') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('warehouse.refName') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('numbers.paid_amount') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('docs.status') }}</th>
          <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('actions.operations') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in store.list" :key="item.id" @click="viewItem(item.id)" class="cursor-pointer hover:bg-gray-100">
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ item.id }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ formatDate(item.date) }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ item.student.full_name }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ item.warehouse.name }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">{{ item.paid_amount }}</td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">
            <SquareCheckBig v-if="item.accepted" class="w-5 h-5 text-green-600" />
            <CircleOff v-else class="w-5 h-5 text-red-600" />
          </td>
          <td class="px-5 py-5 border-b border-gray-200 text-sm">
            <div class="flex items-center space-x-4">
              <NuxtLink :to="localePath(`/selling-dishes/${item.id}/edit`)" @click.stop class="text-indigo-600 hover:text-indigo-900"><Pencil class="w-5 h-5"/></NuxtLink>
              <button @click.stop="confirmDelete(item.id)" class="text-red-600 hover:text-red-900"><Trash2 class="w-5 h-5"/></button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
      <BasePagination :total-records="store.totalRecords" :page-size="store.pageSize" :current-page="store.currentPage" :total-pages="store.totalPages" @page-changed="goToPage" />
    </div>

    <StudentSelectDialog v-model="showStudentDialog" @select="handleStudentSelect" />
    <ConfirmDialog v-model="showDeleteModal" :title="$t('captions.confirmDelete')" :message="$t('docs.confirmDelete')" @confirm="deleteItemConfirmed" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSellingDishesStore } from '~/stores/sellingDishes';
import { useWarehouseStore } from '~/stores/warehouses';
import { type Student } from '~/stores/students';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Pencil, Trash2, SquareCheckBig, CircleOff, X, SquareMousePointer } from 'lucide-vue-next';
import BaseSpinner from '~/components/BaseSpinner.vue';
import BasePagination from '~/components/BasePagination.vue';
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue';
import DateRangePicker from '~/components/dialogs/DateRangePicker.vue';
import StudentSelectDialog from '~/components/dialogs/StudentSelectDialog.vue';

const store = useSellingDishesStore();
const warehouseStore = useWarehouseStore();
const router = useRouter();
const localePath = useLocalePath();
const { t } = useI18n();

const showStudentDialog = ref(false);
const showDeleteModal = ref(false);
const itemToDeleteId = ref<number | null>(null);
const selectedStudentName = ref('');

const localSearchQuery = ref({
  dates: { from: store.searchQuery.date_from, to: store.searchQuery.date_to },
  warehouse: store.searchQuery.warehouse,
  student: store.searchQuery.student,
});

function handleSearch() {
  store.searchQuery.date_from = localSearchQuery.value.dates.from;
  store.searchQuery.date_to = localSearchQuery.value.dates.to;
  store.searchQuery.warehouse = localSearchQuery.value.warehouse;
  store.searchQuery.student = localSearchQuery.value.student;
  store.fetchRecords(1);
}

function handleReset() {
  localSearchQuery.value = { dates: { from: null, to: null }, warehouse: null, student: null };
  selectedStudentName.value = '';
  handleSearch();
}

function goToPage(page: number) { store.fetchRecords(page); }
function viewItem(id: number) { router.push(localePath(`/selling-dishes/${id}`)); }
function confirmDelete(id: number) {
  itemToDeleteId.value = id;
  showDeleteModal.value = true;
}
async function deleteItemConfirmed() {
  if (itemToDeleteId.value) await store.deleteRecord(itemToDeleteId.value);
}
function handleStudentSelect(student: Student) {
  localSearchQuery.value.student = student.id;
  selectedStudentName.value = student.full_name;
  showStudentDialog.value = false;
}
function clearStudent() {
  localSearchQuery.value.student = null;
  selectedStudentName.value = '';
}
function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
  store.fetchRecords(store.currentPage);
  if (warehouseStore.warehouses.length === 0) {
    warehouseStore.fetchRecords(1);
  }
});
</script>
