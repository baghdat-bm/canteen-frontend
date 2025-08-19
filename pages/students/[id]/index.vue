<template>
  <div class="container mx-auto">
    <div v-if="store.isLoading" class="text-center p-8 bg-white rounded-lg shadow">
      <BaseSpinner />
      <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
    </div>

    <div v-else-if="!store.student" class="text-center p-8 bg-white rounded-lg shadow text-red-500">
      {{ $t('messages.fetchErrorItem') }}
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-6">
        <div class="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
          <!-- Фото -->
          <div class="flex-shrink-0 mb-4 md:mb-0">
            <img :src="store.student.photo" alt="Student Photo" class="w-32 h-32 rounded-full object-cover border-4 border-gray-200" @error="onImageError">
          </div>

          <!-- Детальная информация -->
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-3xl font-bold text-gray-900">{{ store.student.full_name }}</h1>
            <p class="text-gray-500 mt-1">{{ $t('student.refName') }} ID: {{ store.student.id }}</p>

            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div class="p-3 bg-gray-50 rounded-md">
                <p class="font-semibold text-gray-600">{{ $t('student.iin') }}</p>
                <p class="text-gray-800">{{ store.student.iin || '–' }}</p>
              </div>
              <div class="p-3 bg-gray-50 rounded-md">
                <p class="font-semibold text-gray-600">{{ $t('student.class_number') }}</p>
                <p class="text-gray-800">{{ store.student.class_number || '–' }}</p>
              </div>
              <div class="p-3 bg-gray-50 rounded-md">
                <p class="font-semibold text-gray-600">{{ $t('student.phone') }}</p>
                <p class="text-gray-800">{{ store.student.phone || '–' }}</p>
              </div>
              <div class="p-3 bg-gray-50 rounded-md">
                <p class="font-semibold text-gray-600">{{ $t('student.birthday') }}</p>
                <p class="text-gray-800">{{ store.student.birthday || '–' }}</p>
              </div>
              <div class="p-3 bg-gray-50 rounded-md">
                <p class="font-semibold text-gray-600">{{ $t('student.personal_account') }}</p>
                <p class="text-gray-800">{{ store.student.personal_account || '–' }}</p>
              </div>
              <div class="p-3 bg-gray-50 rounded-md">
                <p class="font-semibold text-gray-600">{{ $t('student.balance') }}</p>
                <p class="text-gray-800 font-bold">{{ store.student.balance || 0 }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка "Назад к списку" -->
      <div class="px-6 py-4 bg-gray-50 border-t text-right">
        <NuxtLink :to="localePath('/students')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
          {{ $t('navigation.backToList') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { useStudentsStore } from '~/stores/students';
import BaseSpinner from '~/components/BaseSpinner.vue';

const route = useRoute();
const store = useStudentsStore();
const localePath = useLocalePath();

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    store.fetchRecord(id);
  }
});

// Заглушка для битых изображений
function onImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'https://via.placeholder.com/128'; // URL для заглушки
}
</script>
