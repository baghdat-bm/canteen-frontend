<template>
  <div class="container mx-auto p-4">
    <!-- Заголовок страницы и кнопка создания -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ $t('contractors') }}</h1>
      <NuxtLink :to="localePath('/contractors/create')"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="pending" class="text-center">
      <p>{{ $t('loading') }}</p>
    </div>

    <!-- Сообщение, если нет данных -->
    <div v-else-if="store.contractors.length === 0" class="text-center text-gray-500">
       {{ $t('message.noData') }}
    </div>

    <!-- Таблица с данными -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
              ID
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {{ $t('name') }}
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {{ $t('actions.operations') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contractor in store.contractors" :key="contractor.id" @click="viewContractor(contractor.id)"
              class="cursor-pointer hover:bg-gray-100">
            
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ contractor.id }}
            </td>
            
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">
                {{ contractor.name }}
              </p>
            </td>

            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div class="flex items-center space-x-4">
                <NuxtLink :to="localePath(`/contractors/${contractor.id}/edit`)" @click.stop
                          class="text-indigo-600 hover:text-indigo-900">
                  <Pencil class="w-5 h-5"/>
                </NuxtLink>
                <button @click.stop="confirmDelete(contractor.id)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-5 h-5"/>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useContractorsStore } from '~/stores/contractors';
import { Pencil, Trash2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

// --- Подключение composables ---
const router = useRouter();
const localePath = useLocalePath();
const store = useContractorsStore();
const { t } = useI18n();

// --- Загрузка данных ---
const { pending } = await useAsyncData(
  'contractors-list',
  () => store.fetchContractors()
);

// --- Функции ---

/**
 * Переход на страницу детального просмотра
 * @param {number} id - ID контрагента
 */
function viewContractor(id) {
  router.push(localePath(`/contractors/${id}`));
}

/**
 * Запрос подтверждения и удаление
 * @param {number} id - ID контрагента
 */
function confirmDelete(id) {
  if (window.confirm(t('actions.confirmDelete'))) {
    store.deleteContractor(id);
  }
}
</script>
