<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800">{{ $t('welcome') }}, {{ authStore.getUserName }}!</h1>
    <p class="mt-2 text-gray-600">Это главная страница вашего приложения.</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
const authStore = useAuthStore();

// Используем 'default' лейаут с сайдбаром и хедером
definePageMeta({
  layout: 'default',
});
</script>