<template>
  <div class="container mx-auto">
    <!-- Форма в режиме редактирования -->
    <IncomingInvoiceForm
        v-if="!store.isLoading && store.invoice"
        :initial-data="store.invoice"
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
    />
    <!-- Общий спиннер для загрузки и сохранения -->
    <div v-else class="text-center p-8">
      <BaseSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia'; // ИЗМЕНЕНИЕ: Импорт storeToRefs
import { useIncomingInvoicesStore, type IncomingInvoiceDetail } from '~/stores/incomingInvoices';
import IncomingInvoiceForm from '~/components/incoming-invoices/IncomingInvoiceForm.vue';
import BaseSpinner from '~/components/BaseSpinner.vue';

const store = useIncomingInvoicesStore();
const { isSubmitting } = storeToRefs(store); // ИЗМЕНЕНИЕ: Делаем isSubmitting реактивным
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
  // isSubmitting будет управляться внутри action
  const updatedRecord = await store.updateRecord(id, formData);
  if (updatedRecord) {
    router.push(localePath(`/incoming-invoices/${id}`));
  }
}
</script>
