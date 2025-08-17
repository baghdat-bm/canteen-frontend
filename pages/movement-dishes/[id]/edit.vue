<template>
  <div class="container mx-auto">
    <MovementDishForm
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
import { useMovementDishesStore } from '~/stores/movementDishes';
import type { MovementDishPayload } from '~/types/documents';
import MovementDishForm from '~/components/movement-dishes/MovementDishForm.vue';
import BaseSpinner from '~/components/BaseSpinner.vue';

const store = useMovementDishesStore();
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

async function handleSubmit(formData: MovementDishPayload) {
  const id = Number(route.params.id);
  const updatedRecord = await store.updateRecord(id, formData);
  if (updatedRecord) {
    router.push(localePath(`/movement-dishes/${id}`));
  }
}
</script>
