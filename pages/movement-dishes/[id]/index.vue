<template>
  <div class="container mx-auto">

    <!-- Индикатор загрузки -->
    <div v-if="store.isLoading" class="text-center p-8 bg-white rounded-lg shadow">
      <BaseSpinner />
      <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="!store.single" class="text-center p-8 bg-white rounded-lg shadow text-red-500">
      {{ $t('messages.fetchErrorItem') }}
    </div>

    <!-- Форма в режиме просмотра -->
    <MovementDishForm
        v-else
        :initial-data="store.single"
        :is-view-mode="true"
    />

    <div class="flex justify-end items-center mt-4">
      <div class="flex space-x-2">
        <NuxtLink :to="localePath('/movement-dishes')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
          {{ $t('navigation.backToList') }}
        </NuxtLink>
        <NuxtLink :to="localePath(`/movement-dishes/${route.params.id}/edit`)" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          {{ $t('actions.edit') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { useMovementDishesStore } from '~/stores/movementDishes';
import MovementDishForm from '~/components/movement-dishes/MovementDishForm.vue';
import BaseSpinner from '~/components/BaseSpinner.vue';

const route = useRoute();
const store = useMovementDishesStore();
const localePath = useLocalePath();

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    store.fetchRecord(id);
  }
});
</script>
