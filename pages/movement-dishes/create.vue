<template>
  <div class="container mx-auto">
    <MovementDishForm
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMovementDishesStore } from '~/stores/movementDishes';
import type { MovementDishPayload } from '~/types/documents';
import MovementDishForm from '~/components/movement-dishes/MovementDishForm.vue';

const store = useMovementDishesStore();
const { isSubmitting } = storeToRefs(store);
const router = useRouter();
const localePath = useLocalePath();

async function handleSubmit(formData: MovementDishPayload) {
  const createdRecord = await store.createRecord(formData);
  if (createdRecord) {
    router.push(localePath(`/movement-dishes/${createdRecord.id}`));
  }
}
</script>
