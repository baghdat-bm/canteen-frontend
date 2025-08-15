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
import { storeToRefs } from 'pinia'; // ИЗМЕНЕНИЕ: Импорт storeToRefs
import { useIncomingInvoicesStore, type IncomingInvoiceDetail } from '~/stores/incomingInvoices';
import IncomingInvoiceForm from '~/components/incoming-invoices/IncomingInvoiceForm.vue';

const store = useIncomingInvoicesStore();
const { isSubmitting } = storeToRefs(store); // ИЗМЕНЕНИЕ: Делаем isSubmitting реактивным
const router = useRouter();
const localePath = useLocalePath();

async function handleSubmit(formData: IncomingInvoiceDetail) {
  // isSubmitting будет управляться внутри action
  const createdRecord = await store.createRecord(formData);
  if (createdRecord) {
    // Переход на страницу просмотра созданной записи
    router.push(localePath(`/incoming-invoices/${createdRecord.id}`));
  }
  // Если ошибка, уведомление покажется из самого стора
}
</script>
