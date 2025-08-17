<template>
  <div class="container mx-auto">
    <WriteOffForm
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useWriteOffsStore } from '~/stores/writeOffs';
import type { WriteOffPayload } from '~/types/documents';
import WriteOffForm from '~/components/write-offs/WriteOffForm.vue';

const store = useWriteOffsStore();
const { isSubmitting } = storeToRefs(store);
const router = useRouter();
const localePath = useLocalePath();

async function handleSubmit(formData: WriteOffPayload) {
  const createdRecord = await store.createRecord(formData);
  if (createdRecord) {
    router.push(localePath(`/write-offs/${createdRecord.id}`));
  }
}
</script>
