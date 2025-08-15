<template>
  <div class="container mx-auto">
    <!-- Форма в режиме редактирования -->
    <IncomingInvoiceForm
        v-if="!store.isLoading && store.invoice"
        :initial-data="store.invoice"
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
import { useIncomingInvoicesStore, type IncomingInvoiceDetail } from '~/stores/incomingInvoices';
import IncomingInvoiceForm from '~/components/incoming-invoices/IncomingInvoiceForm.vue';
import BaseSpinner from '~/components/BaseSpinner.vue';

const store = useIncomingInvoicesStore();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    store.fetchRecord(id);
  }
});

async function handleSubmit(formData: IncomingInvoiceDetail) {
  const id = Number(route.params.id);
  const updatedRecord = await store.updateRecord(id, formData);
  if (updatedRecord) {
    router.push(localePath(`/incoming-invoices/${id}`));
  }
}
</script>