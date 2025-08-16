<template>
  <div class="flex items-center space-x-2">
    <div class="flex-1">
      <label for="date_from" class="block text-sm font-medium text-gray-700">{{ $t('date.from') }}</label>
      <!-- ИЗМЕНЕНИЕ: Добавлен класс h-10 и заменен p-2 на px-2 -->
      <input
          id="date_from"
          type="date"
          :value="modelValue.from"
          @input="updateDate('from', $event)"
          class="mt-1 h-10 px-2 w-full border border-gray-300 rounded-md"
      />
    </div>
    <div class="flex-1">
      <label for="date_to" class="block text-sm font-medium text-gray-700">{{ $t('date.to') }}</label>
      <!-- ИЗМЕНЕНИЕ: Добавлен класс h-10 и заменен p-2 на px-2 -->
      <input
          id="date_to"
          type="date"
          :value="modelValue.to"
          @input="updateDate('to', $event)"
          class="mt-1 h-10 px-2 w-full border border-gray-300 rounded-md"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface DateRange {
  from: string | null;
  to: string | null;
}

interface Props {
  modelValue: DateRange;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

function updateDate(key: 'from' | 'to', event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: target.value || null, // Отправляем null, если дата очищена
  });
}
</script>
