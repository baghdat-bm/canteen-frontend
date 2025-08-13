<template>
  <div class="flex items-center space-x-2">
    <div class="flex-1">
      <label for="date_from" class="block text-sm font-medium text-gray-700">{{ $t('date.from') }}</label>
      <input
          id="date_from"
          type="date"
          :value="modelValue.from"
          @input="updateDate('from', $event)"
          class="mt-1 p-2 w-full border rounded-md"
      />
    </div>
    <div class="flex-1">
      <label for="date_to" class="block text-sm font-medium text-gray-700">{{ $t('date.to') }}</label>
      <input
          id="date_to"
          type="date"
          :value="modelValue.to"
          @input="updateDate('to', $event)"
          class="mt-1 p-2 w-full border rounded-md"
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
