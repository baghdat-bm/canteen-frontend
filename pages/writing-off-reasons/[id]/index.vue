<template>
  <div class="container mx-auto p-4">
    <div class="w-full max-w-2xl mx-auto">
       <h1 class="text-2xl font-bold mb-6">{{ $t('refs.writingOffReason') }}</h1>
       
       <!-- Индикатор загрузки -->
        <div v-if="store.isLoading" class="text-center">
            <p>{{ $t('loading') }}</p>
        </div>
        
        <!-- Карта с данными -->
        <div v-else-if="store.writingOffReason" class="bg-white p-8 rounded-lg shadow-md">
            <div class="space-y-4">
              <!-- ID -->
              <div class="flex items-baseline">
                <span class="w-1/3 text-gray-500 font-semibold">ID</span>
                <p class="w-2/3 text-gray-900">{{ store.writingOffReason.id }}</p>
              </div>

              <!-- Наименование (KZ) -->
              <div class="flex items-baseline">
                <span class="w-1/3 text-gray-500 font-semibold">{{ $t('name_kz') }}</span>
                <p class="w-2/3 text-gray-900">{{ store.writingOffReason.name_kz }}</p>
              </div>

              <!-- Наименование (RU) -->
              <div class="flex items-baseline">
                <span class="w-1/3 text-gray-500 font-semibold">{{ $t('name_ru') }}</span>
                <p class="w-2/3 text-gray-900">{{ store.writingOffReason.name_ru }}</p>
              </div>

              <!-- Наименование (EN) -->
              <div class="flex items-baseline">
                <span class="w-1/3 text-gray-500 font-semibold">{{ $t('name_en') }}</span>
                <p class="w-2/3 text-gray-900">{{ store.writingOffReason.name_en }}</p>
              </div>

              <div class="flex items-baseline">
                <span class="w-1/3 text-gray-500 font-semibold">{{ $t('refs.writingOff') }}</span>
                <p class="w-2/3 text-gray-900">{{ store.writingOffReason.write_off }}</p>
              </div>

              <div class="flex items-baseline">
                <span class="w-1/3 text-gray-500 font-semibold">{{ $t('refs.requestComment') }}</span>
                <p class="w-2/3 text-gray-900">{{ store.writingOffReason.request_comment }}</p>
              </div>

            </div>
            
            <!-- Кнопки действий -->
             <div class="mt-8 flex justify-end space-x-4">
                <NuxtLink :to="localePath('/writing-off-reasons')" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                  {{ $t('navigation.backToList') }}
                </NuxtLink>
                <NuxtLink :to="localePath(`/writing-off-reasons/${route.params.id}/edit`)" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  {{ $t('actions.edit') }}
                </NuxtLink>
            </div>
        </div>
        
        <!-- Сообщение, если данные не найдены -->
         <div v-else class="text-center text-gray-500">
            <p>{{ $t('messages.notFound') }}</p>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useWritingOffReasonsStore } from '~/stores/writingOffReasons';
import { useI18n } from 'vue-i18n';

// --- Подключение composables ---
const store = useWritingOffReasonsStore();
const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();

// --- Хуки жизненного цикла ---
// Получаем ID из параметров маршрута и загружаем данные при монтировании компонента
onMounted(() => {
    const id = Number(route.params.id);
    if (!isNaN(id)) {
        store.fetchRecords(id);
    }
});
</script>
