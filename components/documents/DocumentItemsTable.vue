<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ title }}</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
        <tr>
          <!-- Заголовки колонок передаются через слоты -->
          <slot name="head"></slot>
          <th v-if="!isViewMode" class="w-auto px-2 py-2"></th>
        </tr>
        </thead>
        <tbody>
        <!-- Сообщение для пустой таблицы -->
        <tr v-if="items.length === 0">
          <td colspan="10" class="text-center text-gray-500 py-4 italic">
            {{ $t('messages.pressAddRowToAddNewDish') }}
          </td>
        </tr>

        <tr v-for="(item, index) in items" :key="index">
          <!-- Содержимое строк передается через слоты -->
          <slot name="row" :item="item" :index="index"></slot>
          <td v-if="!isViewMode" class="p-1 text-center">
            <button @click="emit('removeRow', index)" class="text-red-500 hover:text-red-700">
              <Trash2 class="w-5 h-5" />
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <button v-if="!isViewMode" @click="emit('addRow')" class="mt-4 px-4 py-2 border rounded-md text-sm text-indigo-600 hover:bg-indigo-50">
      {{ addRowText }} <em>(Insert)</em>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';

defineProps<{
  items: any[];
  title: string;
  addRowText: string;
  isViewMode?: boolean;
}>();

const emit = defineEmits(['addRow', 'removeRow']);
</script>
