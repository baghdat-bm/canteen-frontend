<template>
  <div class="container mx-auto">
    <div v-if="store.isLoading" class="text-center p-8 bg-white rounded-lg shadow">
      <BaseSpinner/>
    </div>
    <div v-else-if="!store.single" class="text-center p-8 bg-white rounded-lg shadow text-red-500">
      {{ $t('messages.fetchErrorItem') }}
    </div>
    <SellingForm v-else :initial-data="store.single" :is-view-mode="true"/>
    <div class="flex justify-end items-center mt-4">
      <div class="flex space-x-2">
        <NuxtLink :to="localePath('/selling-dishes')"
                  class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">{{ $t('navigation.backToList') }}
        </NuxtLink>
        <NuxtLink :to="localePath(`/selling-dishes/${route.params.id}/edit`)"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{{ $t('actions.edit') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router';
import {onMounted} from 'vue';
import {useSellingDishesStore} from '~/stores/sellingDishes';
import SellingForm from '~/components/selling-dishes/SellingForm.vue';
import BaseSpinner from '~/components/BaseSpinner.vue';

const route = useRoute();
const store = useSellingDishesStore();
const localePath = useLocalePath();

onMounted(() => {
  store.fetchRecord(Number(route.params.id));
});
</script>