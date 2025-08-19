<template>
  <div class="container mx-auto">
    <SellingForm :is-submitting="isSubmitting" @submit="handleSubmit"/>
  </div>
</template>

<script setup lang="ts">
import {useRouter} from 'vue-router';
import {storeToRefs} from 'pinia';
import {useSellingDishesStore} from '~/stores/sellingDishes';
import type {SellingDishPayload} from '~/types/documents';
import SellingForm from '~/components/selling-dishes/SellingForm.vue';

const store = useSellingDishesStore();
const {isSubmitting} = storeToRefs(store);
const router = useRouter();
const localePath = useLocalePath();

async function handleSubmit(formData: SellingDishPayload) {
  const createdRecord = await store.createRecord(formData);
  if (createdRecord) {
    router.push(localePath(`/selling-dishes/${createdRecord.id}`));
  }
}
</script>