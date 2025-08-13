<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import IncomingInvoiceForm from '~/components/incoming-invoices/IncomingInvoiceForm.vue';
import { useIncomingInvoicesStore } from '~/stores/incomingInvoices';
import type { IncomingInvoiceDetail } from '~/stores/incomingInvoices';

const route = useRoute();
const router = useRouter();
const store = useIncomingInvoicesStore();

const model = ref<IncomingInvoiceDetail | null>(null);

onMounted(async () => {
  const id = Number(route.params.id);
  await store.fetchRecord(id);
  model.value = store.invoice;
});

async function handleSubmit(payload: any) {
  const id = Number(route.params.id);
  const updated = await store.updateRecord(id, payload);
  if (updated?.id) {
    router.push(`/incoming-invoices/${updated.id}`);
  }
}
</script>

<template>
  <div class="p-4 lg:p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Редактирование накладной</h1>
    </div>

    <div v-if="!model" class="text-gray-500">Загрузка…</div>
    <IncomingInvoiceForm
        v-else
        mode="edit"
        v-model="form"
        @submit="handleSubmit"
        @cancel="$router.back()"
    />
  </div>
</template>
