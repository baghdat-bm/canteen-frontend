<script setup lang="ts">
import { useRouter } from 'vue-router';
import IncomingInvoiceForm from '~/components/incoming-invoices/IncomingInvoiceForm.vue';
import { useIncomingInvoicesStore } from '~/stores/incomingInvoices';

const router = useRouter();
const store = useIncomingInvoicesStore();

async function handleSubmit(payload: Parameters<typeof store.createRecord>[0]) {
  const created = await store.createRecord(payload);
  if (created?.id) {
    router.push(`/incoming-invoices/${created.id}`);
  }
}
</script>

<template>
  <div class="p-4 lg:p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Новая приходная накладная</h1>
    </div>

    <IncomingInvoiceForm mode="create" v-model="form" @submit="handleSubmit" @cancel="$router.back()" />
  </div>
</template>
