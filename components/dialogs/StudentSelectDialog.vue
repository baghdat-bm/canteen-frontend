<template>
  <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
  >
    <div
        v-if="modelValue"
        ref="overlay"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        class="fixed inset-0 bg-gray-700 bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    >
      <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
      >
        <div v-if="modelValue" class="p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">{{ $t('student.select') }}</h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
                type="text"
                v-model="localSearch.full_name"
                :placeholder="$t('search.byFullName')"
                class="p-2 border rounded-md"
                @keyup.enter="runSearch"
            />
            <input
                type="text"
                v-model="localSearch.iin"
                :placeholder="$t('search.byIin')"
                class="p-2 border rounded-md"
                @keyup.enter="runSearch"
            />
            <div class="flex space-x-2">
              <button @click="runSearch" class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{{ $t('search.find') }}</button>
              <button @click="resetSearch" class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">{{ $t('search.reset') }}</button>
            </div>
          </div>

          <div v-if="studentsStore.isLoading" class="text-center p-8">
            <BaseSpinner />
          </div>

          <div v-else class="overflow-y-auto max-h-96">
            <table class="min-w-full leading-normal">
              <thead>
              <tr>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('student.fullName') }}</th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{{ $t('student.iin') }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-if="studentsStore.students.length === 0">
                <td colspan="3" class="text-center py-4 text-gray-500">{{ $t('messages.noData') }}</td>
              </tr>
              <tr v-for="student in studentsStore.students" :key="student.id" @click="handleSelect(student)" class="cursor-pointer hover:bg-gray-100 transition-colors">
                <td class="px-5 py-4 border-b border-gray-200 text-sm">{{ student.id }}</td>
                <td class="px-5 py-4 border-b border-gray-200 text-sm">{{ student.full_name }}</td>
                <td class="px-5 py-4 border-b border-gray-200 text-sm">{{ student.iin }}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <BasePagination
              v-if="!studentsStore.isLoading && studentsStore.students.length > 0"
              :total-records="studentsStore.totalRecords"
              :page-size="studentsStore.pageSize"
              :current-page="studentsStore.currentPage"
              :total-pages="studentsStore.totalPages"
              @page-changed="goToPage"
              class="mt-4"
          />

          <div class="text-right mt-4">
            <button @click="handleCancel" class="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-300">{{ $t('actions.close') }}</button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useStudentsStore, type Student } from '~/stores/students';
import BaseSpinner from '~/components/BaseSpinner.vue';
import BasePagination from '~/components/BasePagination.vue';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'select']);

const studentsStore = useStudentsStore();
const localSearch = ref({ full_name: '', iin: '' });
const overlay = ref<HTMLElement | null>(null);
let isPotentialClose = false;

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    studentsStore.reset();
    studentsStore.fetchRecords(1);
  }
});

function runSearch() {
  studentsStore.searchQuery.full_name = localSearch.value.full_name;
  studentsStore.searchQuery.iin = localSearch.value.iin;
  studentsStore.fetchRecords(1);
}

function resetSearch() {
  localSearch.value = { full_name: '', iin: '' };
  runSearch();
}

function goToPage(page: number) { studentsStore.fetchRecords(page); }
function handleSelect(student: Student) {
  emit('select', student);
  emit('update:modelValue', false);
}
function handleCancel() { emit('update:modelValue', false); }
function onMouseDown(event: MouseEvent) { if (event.target === overlay.value) isPotentialClose = true; }
function onMouseUp() {
  if (isPotentialClose) handleCancel();
  isPotentialClose = false;
}
</script>
