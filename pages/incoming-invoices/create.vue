<template>
  <div class="container mx-auto">
    <!-- Форма теперь получает состояние isSubmitting -->
    <IncomingInvoiceForm
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useIncomingInvoicesStore } from '~/stores/incomingInvoices';
import type { IncomingInvoicePayload } from '~/types/documents'; // ИЗМЕНЕНИЕ: Импорт из нового файла
import IncomingInvoiceForm from '~/components/incoming-invoices/IncomingInvoiceForm.vue';

const store = useIncomingInvoicesStore();
const { isSubmitting } = storeToRefs(store);
const router = useRouter();
const localePath = useLocalePath();

// ИЗМЕНЕНИЕ: Тип formData теперь IncomingInvoicePayload
async function handleSubmit(formData: IncomingInvoicePayload) {
  const createdRecord = await store.createRecord(formData);
  if (createdRecord) {
    router.push(localePath(`/incoming-invoices/${createdRecord.id}`));
  }
}
</script>
