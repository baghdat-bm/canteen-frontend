<template>
  <div class="container mx-auto">
    <SellingForm v-if="!store.isLoading && store.single" :initial-data="store.single" :is-submitting="isSubmitting"
                 @submit="handleSubmit"/>
    <div v-else class="text-center p-8">
      <BaseSpinner/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from 'vue-router';
import {onMounted} from 'vue';
import {storeToRefs} from 'pinia';
import {useSellingDishesStore} from '~/stores/sellingDishes';
import type {SellingDishPayload} from '~/types/documents';
import SellingForm from '~/components/selling-dishes/SellingForm.vue';
import BaseSpinner from '~/components/BaseSpinner.vue';

const store = useSellingDishesStore();
const {isSubmitting} = storeToRefs(store);
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();

onMounted(() => {
  store.fetchRecord(Number(route.params.id));
});

async function handleSubmit(formData: SellingDishPayload) {
  const id = Number(route.params.id);
  const updatedRecord = await store.updateRecord(id, formData);
  if (updatedRecord) {
    router.push(localePath(`/selling-dishes/${id}`));
  }
}
</script>