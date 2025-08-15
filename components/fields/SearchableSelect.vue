<template>
  <div class="relative" ref="wrapper">
    <!-- Input field -->
    <input
        ref="inputRef"
        type="text"
        v-model="searchTerm"
        :placeholder="placeholder"
        @keydown="handleKeydown"
        @focus="onFocus"
        class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        :class="{ 'bg-gray-100': disabled }"
        :disabled="disabled"
    />

    <!-- Teleported dropdown -->
    <Teleport to="body">
      <Transition
          enter-active-class="transition-all duration-100 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
      >
        <div
            v-if="showDropdown && searchResults.length > 0"
            :style="dropdownStyle"
            class="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <ul>
            <li
                v-for="(item, index) in searchResults"
                :key="item.id"
                @click="selectItem(item)"
                @mouseenter="highlightedIndex = index"
                :class="{ 'bg-indigo-100': index === highlightedIndex }"
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
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
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
const highlightedIndex = ref(-1);

function focus() {
  inputRef.value?.focus();
}
defineExpose({ focus });

// --- ИЗМЕНЕНИЕ: Добавлены диагностические сообщения ---
watch(
    () => [props.modelValue, props.displayField],
    ([newModel, newDisplayField]) => {
      console.log('--- [SearchableSelect] Watch Fired ---');
      console.log('-> Получен displayField:', newDisplayField);
      // Используем structuredClone для безопасного логирования, чтобы избежать мутаций
      console.log('-> Получен modelValue:', newModel ? JSON.parse(JSON.stringify(newModel)) : newModel);

      if (typeof newModel === 'object' && newModel && newDisplayField in newModel) {
        console.log('✅ Условие выполнено: modelValue является объектом и содержит поле', newDisplayField);
        searchTerm.value = newModel[newDisplayField];
        console.log('-> searchTerm установлен в:', searchTerm.value);
      } else if (!newModel) {
        console.log('🟡 Условие выполнено: modelValue пуст. Очищаем searchTerm.');
        searchTerm.value = '';
      } else {
        console.error('❌ Условие НЕ выполнено. Не удалось установить searchTerm.');
        console.log('   - typeof newModel:', typeof newModel);
        console.log('   - newModel (truthy):', !!newModel);
        if (typeof newModel === 'object' && newModel) {
          console.log(`   - Проверка '${newDisplayField}' in newModel:`, newDisplayField in newModel);
        }
      }
      console.log('--- [SearchableSelect] End of Watch ---');
    },
    {
      immediate: true,
      deep: true,
    }
);
// --- КОНЕЦ ИЗМЕНЕНИЯ ---

// --- Positioning Logic ---
function updateDropdownPosition() {
  if (!inputRef.value || !showDropdown.value) return;
  const rect = inputRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom + window.scrollY + 4}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
  };
}

watch(showDropdown, (isVisible) => {
  if (isVisible) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
});

// --- Event Handlers ---
function hide() {
  showDropdown.value = false;
  highlightedIndex.value = -1;
}

function onFocus() {
  if (searchResults.value.length > 0) {
    showDropdown.value = true;
  }
}

// --- Keyboard Navigation ---
async function handleKeydown(event: KeyboardEvent) {
  if (showDropdown.value && searchResults.value.length > 0) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        highlightedIndex.value = (highlightedIndex.value + 1) % searchResults.value.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (highlightedIndex.value <= 0) {
          highlightedIndex.value = searchResults.value.length - 1;
        } else {
          highlightedIndex.value--;
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex.value !== -1) {
          selectItem(searchResults.value[highlightedIndex.value]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        hide();
        break;
    }
  } else if (event.key === 'Enter') {
    event.preventDefault();
    await performSearch();
  }
}

onMounted(() => {
  window.addEventListener('resize', updateDropdownPosition);
  document.addEventListener('scroll', updateDropdownPosition, true);
});
onUnmounted(() => {
  window.removeEventListener('resize', updateDropdownPosition);
  document.removeEventListener('scroll', updateDropdownPosition, true);
});

// --- Search and Select Logic ---
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

  highlightedIndex.value = -1;

  if (searchResults.value.length > 0) {
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

onClickOutside(wrapper, hide);
</script>
