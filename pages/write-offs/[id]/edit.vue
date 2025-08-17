<template>
  <div class="container mx-auto">
    <WriteOffForm
        v-if="!store.isLoading && store.single"
        :initial-data="store.single"
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
    />

    <div v-else class="text-center p-8">
      <BaseSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useWriteOffsStore } from '~/stores/writeOffs';
import type { WriteOffPayload } from '~/types/documents';
import WriteOffForm from '~/components/write-offs/WriteOffForm.vue';
import BaseSpinner from '~/components/BaseSpinner.vue';

const store = useWriteOffsStore();
const { isSubmitting } = storeToRefs(store);
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    store.fetchRecord(id);
  }
});

async function handleSubmit(formData: WriteOffPayload) {
  const id = Number(route.params.id);
  const updatedRecord = await store.updateRecord(id, formData);
  if (updatedRecord) {
    router.push(localePath(`/write-offs/${id}`));
  }
}
</script>
