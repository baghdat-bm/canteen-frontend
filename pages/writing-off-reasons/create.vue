<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ $t('refs.createWritingOffReason') }}</h1>
      <div class="bg-white p-8 rounded-lg shadow-md">
        <WritingOffReasonForm @submit="handleSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWritingOffReasonsStore } from '~/stores/writingOffReasons';
import type { WritingOffReasonPayload } from '~/stores/writingOffReasons';
import WritingOffReasonForm from '~/components/writing-off-reasons/WritingOffReasonForm.vue';

const store = useWritingOffReasonsStore();
const { t } = useI18n();
const localePath = useLocalePath();

// Обработчик отправки формы
const handleSubmit = async (formData: WritingOffReasonPayload) => {
  try {
    await store.createRecord(formData);
    await navigateTo(localePath('/writing-off-reasons'));
  }
  catch (error) {
    console.error('Failed to create write-offs-reasons:', error);
    alert(t('message.couldntCreateWritingOffReason'));
  }
};
</script>