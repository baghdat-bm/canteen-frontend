<template>
  <div class="flex items-center justify-center h-screen bg-gray-200">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center text-gray-700">{{ $t('login_title') }}</h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="login" class="text-sm font-medium text-gray-700">{{ $t('login_field') }}</label>
          <input v-model="login" id="login" type="text" required
                 class="w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-opacity-50 focus:ring-indigo-300">
        </div>
        <div>
          <label for="password" class="text-sm font-medium text-gray-700">{{ $t('password_field') }}</label>
          <input v-model="password" id="password" type="password" required
                 class="w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-opacity-50 focus:ring-indigo-300">
        </div>

        <div v-if="error" class="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {{ error }}
        </div>

        <div>
          <button type="submit" :disabled="isLoading"
                  class="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700 disabled:bg-indigo-400">
            <span v-if="!isLoading">{{ $t('login_button') }}</span>
            <span v-else>Кіру...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'empty'
});

const authStore = useAuthStore();
const { t } = useI18n();

const login = ref('Диспетчер-столовой-школы-202'); // для удобства тестирования
const password = ref('Qwerty1+'); // для удобства тестирования
const isLoading = ref(false);
const error = ref(''); // переменная для хранения текста ошибки

const handleLogin = async () => {
  isLoading.value = true;
  error.value = ''; // Сбрасываем ошибку перед новым запросом
  try {
    await authStore.login({ login: login.value, password: password.value });
  } catch (e) {
    console.error('Компонент получил ошибку:', e.message);
    error.value = e.message; // Записываем ошибку в state для отображения
  } finally {
    isLoading.value = false;
  }
};
</script>