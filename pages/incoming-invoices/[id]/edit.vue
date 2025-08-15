<template>
  <div class="container mx-auto">
    <!-- Форма в режиме редактирования -->
    <!-- ИЗМЕНЕНИЕ: Проверяем и передаем store.single -->
    <IncomingInvoiceForm
        v-if="!store.isLoading && store.single"
        :initial-data="store.single"
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
import { storeToRefs } from 'pinia';
import { useIncomingInvoicesStore } from '~/stores/incomingInvoices';
import type { IncomingInvoicePayload } from '~/types/documents'; // ИЗМЕНЕНИЕ: Импорт из нового файла
import IncomingInvoiceForm from '~/components/incoming-invoices/IncomingInvoiceForm.vue';
import BaseSpinner from '~/components/BaseSpinner.vue';

const store = useIncomingInvoicesStore();
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

// ИЗМЕНЕНИЕ: Тип formData теперь IncomingInvoicePayload
async function handleSubmit(formData: IncomingInvoicePayload) {
  const id = Number(route.params.id);
  const updatedRecord = await store.updateRecord(id, formData);
  if (updatedRecord) {
    router.push(localePath(`/incoming-invoices/${id}`));
  }
}
</script>
