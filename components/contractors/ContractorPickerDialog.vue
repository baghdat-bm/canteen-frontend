<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { api, type PaginatedResponse } from '~/utils/apiClient';

interface Contractor {
  id: number;
  name: string;
  bin?: string;
  bik?: string;
  bank?: string;
  corr_account?: string;
  check_account?: string;
}

const props = defineProps<{
  /** Управление показом диалога */
  open: boolean;
  /** Необязательный заголовок */
  title?: string;
  /** Размер страницы (пагинация) */
  pageSize?: number;
  /** Начальные значения поиска */
  initialName?: string;
  initialBin?: string;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'select', contractor: Contractor): void;
  (e: 'close'): void;
}>();

const isOpen = ref(props.open);
watch(
    () => props.open,
    v => (isOpen.value = v)
);
watch(isOpen, v => emit('update:open', v));

const title = computed(() => props.title ?? 'Выбор контрагента');

const searchName = ref(props.initialName ?? '');
const searchBin = ref(props.initialBin ?? '');

const items = ref<Contractor[]>([]);
const isLoading = ref(false);
const totalRecords = ref(0);
const pageSize = ref(props.pageSize ?? 10);
const currentPage = ref(1);
const totalPages = computed(() =>
    totalRecords.value ? Math.ceil(totalRecords.value / pageSize.value) : 1
);

const selectedId = ref<number | null>(null);
const selected = computed(() => items.value.find(i => i.id === selectedId.value) || null);

function close() {
  isOpen.value = false;
  emit('close');
}

async function fetchList(page = 1) {
  isLoading.value = true;
  currentPage.value = page;

  try {
    const params = new URLSearchParams();
    // всегда пагинация
    params.set('page', String(page));
    params.set('page_size', String(pageSize.value));
    // поиск
    if (searchName.value) params.set('name', searchName.value.trim());
    if (searchBin.value) params.set('bin', searchBin.value.trim());

    const url = `/contractors/?${params.toString()}`;
    const data = await api.refs<PaginatedResponse<Contractor>>(url, { method: 'get' });

    items.value = data.results;
    totalRecords.value = data.count;

    // если выбранный вывалился со страницы — снять выбор
    if (selectedId.value && !items.value.some(x => x.id === selectedId.value)) {
      selectedId.value = null;
    }
  } catch (e) {
    console.error('Не удалось загрузить список контрагентов', e);
  } finally {
    isLoading.value = false;
  }
}

function applySearch() {
  fetchList(1);
}

function resetSearch() {
  searchName.value = '';
  searchBin.value = '';
  fetchList(1);
}

function chooseAndClose() {
  if (selected.value) {
    emit('select', selected.value);
    isOpen.value = false;
  }
}

// Инициализация при первом открытии
watch(
    isOpen,
    (v) => {
      if (v) fetchList(1);
    },
    { immediate: false }
);
</script>

<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <!-- overlay -->
      <div class="absolute inset-0 bg-black/50" @click="close" />
      <!-- dialog -->
      <div
          class="absolute inset-0 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
      >
        <div class="w-full max-w-3xl rounded-2xl bg-white shadow-xl border overflow-hidden">
          <!-- header -->
          <div class="px-4 py-3 border-b flex items-center justify-between">
            <h3 class="text-base font-semibold">{{ title }}</h3>
            <button
                type="button"
                class="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Закрыть"
                @click="close"
            >
              ✕
            </button>
          </div>

          <!-- content -->
          <div class="p-4 space-y-4">
            <!-- filters -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">Наименование</label>
                <input
                    v-model="searchName"
                    type="text"
                    class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    placeholder="Например: ТОО Ромашка"
                    @keyup.enter="applySearch"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">БИН</label>
                <input
                    v-model="searchBin"
                    type="text"
                    class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    placeholder="Например: 123456789012"
                    @keyup.enter="applySearch"
                />
              </div>
              <div class="flex items-end gap-2">
                <button
                    type="button"
                    class="rounded-lg px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
                    @click="applySearch"
                >
                  Найти
                </button>
                <button
                    type="button"
                    class="rounded-lg px-3 py-2 text-sm font-medium border hover:bg-gray-50"
                    @click="resetSearch"
                >
                  Сбросить
                </button>
              </div>
            </div>

            <!-- table -->
            <div class="border rounded-xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 text-gray-600">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium">Наименование</th>
                    <th class="px-4 py-2 text-left font-medium">БИН</th>
                    <th class="px-4 py-2 text-right font-medium">Действия</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="isLoading">
                    <td colspan="3" class="px-4 py-6 text-center text-gray-500">Загрузка…</td>
                  </tr>
                  <tr
                      v-for="c in items"
                      :key="c.id"
                      class="border-t cursor-pointer"
                      :class="selectedId === c.id ? 'bg-gray-50' : ''"
                      @click="selectedId = c.id"
                      @dblclick="emit('select', c); isOpen = false"
                  >
                    <td class="px-4 py-2">{{ c.name }}</td>
                    <td class="px-4 py-2">{{ c.bin || '' }}</td>
                    <td class="px-4 py-2 text-right">
                      <button
                          type="button"
                          class="rounded-lg px-2 py-1 text-xs font-medium bg-gray-900 text-white hover:bg-gray-800"
                          @click.stop="emit('select', c); isOpen = false"
                      >
                        Выбрать
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!isLoading && items.length === 0">
                    <td colspan="3" class="px-4 py-6 text-center text-gray-500">
                      Ничего не найдено
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <!-- pagination -->
              <div class="flex items-center justify-between border-t px-4 py-2 text-sm">
                <div class="text-gray-600">
                  Всего: <span class="font-medium">{{ totalRecords }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <button
                      class="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                      :disabled="currentPage <= 1"
                      @click="fetchList(currentPage - 1)"
                  >
                    Назад
                  </button>
                  <span class="px-2">{{ currentPage }} / {{ totalPages }}</span>
                  <button
                      class="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                      :disabled="currentPage >= totalPages"
                      @click="fetchList(currentPage + 1)"
                  >
                    Вперёд
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- footer -->
          <div class="px-4 py-3 border-t flex items-center justify-end gap-2">
            <button
                type="button"
                class="rounded-lg px-3 py-2 text-sm font-medium border hover:bg-gray-50"
                @click="close"
            >
              Отмена
            </button>
            <button
                type="button"
                class="rounded-lg px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                :disabled="!selected"
                @click="chooseAndClose"
            >
              Выбрать
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
