<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">{{ $t('name') }}</label>
      <input type="text" id="name" v-model="formData.name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
    </div>
    <div>
      <label for="bik" class="block text-sm font-medium text-gray-700">{{ $t('refs.bik') }}</label>
      <input type="text" id="bik" v-model="formData.bik" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
    </div>
    <div>
      <label for="bank" class="block text-sm font-medium text-gray-700">Банк</label>
      <input type="text" id="bank" v-model="formData.bank" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
    </div>
    <div>
      <label for="corr_account" class="block text-sm font-medium text-gray-700">{{ $t('refs.corr_account') }}</label>
      <input type="text" id="corr_account" v-model="formData.corr_account" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
    </div>
    <div>
      <label for="check_account" class="block text-sm font-medium text-gray-700">{{ $t('refs.check_account') }}</label>
      <input type="text" id="check_account" v-model="formData.check_account" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
    </div>
    
    <div class="flex justify-end space-x-4">
      <NuxtLink :to="localePath('/contractors')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
          {{ $t('actions.cancel') }}
        </NuxtLink>
      <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
        {{ isSubmitting ? $t('actions.saving') : $t('actions.save') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';

const { t } = useI18n();
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      name: '',
      bik: '',
      bank: '',
      corr_account: '',
      check_account: ''
    })
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

const formData = ref({ ...props.initialData });
const localePath = useLocalePath();

// Если initialData изменятся (например, данные загрузятся позже), обновляем форму
watch(() => props.initialData, (newData) => {
  formData.value = { ...newData };
}, { deep: true });

function handleSubmit() {
  emit('submit', formData.value);
}
</script>