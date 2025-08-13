<template>
  <div class="relative" ref="wrapper">
    <!-- Input field, к которому будем привязывать позицию -->
    <input
        ref="inputRef"
        type="text"
        v-model="searchTerm"
        :placeholder="placeholder"
        @keydown.enter.prevent="performSearch"
        @focus="onFocus"
        class="w-full p-2 border rounded-md"
        :class="{ 'bg-gray-100': disabled }"
        :disabled="disabled"
    />

    <!-- Телепортируем выпадающий список в конец body -->
    <Teleport to="body">
      <Transition
          enter-active-class="transition-all duration-100 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
      >
        <!-- У списка теперь динамические стили для позиционирования -->
        <div
            v-if="showDropdown && searchResults.length > 0"
            :style="dropdownStyle"
            class="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <ul>
            <li
                v-for="item in searchResults"
                :key="item.id"
                @click="selectItem(item)"
                class="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {{ item[displayField] }}
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { onClickOutside } from '@vueuse/core';

// --- Props & Emits ---
const props = defineProps<{
  modelValue: number | object | null;
  store: any;
  resultsKey: string;
  searchField: string;
  displayField: string;
  placeholder?: string;
  disabled?: boolean;
}>();
const emit = defineEmits(['update:modelValue']);

// --- State ---
const searchTerm = ref('');
const searchResults = ref<any[]>([]);
const showDropdown = ref(false);
const wrapper = ref(null);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownStyle = ref({});

// --- Логика позиционирования ---
function updateDropdownPosition() {
  if (!inputRef.value || !showDropdown.value) return;
  const rect = inputRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    // position: 'absolute' теперь в классе
    top: `${rect.bottom + window.scrollY + 4}px`, // +4px для небольшого отступа
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
  };
}

// --- Обработчики событий ---
function hide() {
  showDropdown.value = false;
}

function onFocus() {
  // Можно показывать список с последними результатами при фокусе, если они есть
  if (searchResults.value.length > 0) {
    updateDropdownPosition();
    showDropdown.value = true;
  }
}

// Добавляем и удаляем слушатели событий окна для подстройки позиции
onMounted(() => {
  window.addEventListener('resize', updateDropdownPosition);
  // Слушаем скролл на всем документе
  document.addEventListener('scroll', updateDropdownPosition, true);
});
onUnmounted(() => {
  window.removeEventListener('resize', updateDropdownPosition);
  document.removeEventListener('scroll', updateDropdownPosition, true);
});

// --- Логика поиска и выбора ---
watch(() => props.modelValue, (newValue) => {
  if (typeof newValue === 'object' && newValue && props.displayField in newValue) {
    searchTerm.value = newValue[props.displayField];
  }
}, { immediate: true });

async function performSearch() {
  if (!searchTerm.value) {
    searchResults.value = [];
    hide();
    return;
  }

  Object.keys(props.store.searchQuery).forEach(key => {
    props.store.searchQuery[key] = '';
  });
  props.store.searchQuery[props.searchField] = searchTerm.value;

  await props.store.fetchRecords(1);

  searchResults.value = props.store[props.resultsKey] || [];

  await nextTick();
  if (searchResults.value.length > 0) {
    updateDropdownPosition();
    showDropdown.value = true;
  } else {
    hide();
  }
}

function selectItem(item: any) {
  searchTerm.value = item[props.displayField];
  hide();
  searchResults.value = [];
  emit('update:modelValue', item);
}

// Закрываем по клику вне основного компонента
onClickOutside(wrapper, hide);
</script>
