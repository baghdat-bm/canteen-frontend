<template>
  <div class="container mx-auto">
    <!-- Заголовок -->
    <h1 class="text-2xl font-bold mb-4">{{ $t('incomingInvoice.creating') }}</h1>

    <!-- Компонент формы -->
    <IncomingInvoiceForm @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useIncomingInvoicesStore, type IncomingInvoiceDetail } from '~/stores/incomingInvoices';
import IncomingInvoiceForm from '~/components/incoming-invoices/IncomingInvoiceForm.vue';

const store = useIncomingInvoicesStore();
const router = useRouter();
const localePath = useLocalePath();

async function handleSubmit(formData: IncomingInvoiceDetail) {
  const createdRecord = await store.createRecord(formData);
  if (createdRecord) {
    // Переход на страницу просмотра созданной записи
    router.push(localePath(`/incoming-invoices/${createdRecord.id}`));
  }
  // Если ошибка, уведомление покажется из самого стора
}
</script>
