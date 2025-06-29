<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{{ $t('contractors') }}</h1>
      <NuxtLink :to="localePath('/contractors/create')" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
        {{ $t('create_new') }}
      </NuxtLink>
    </div>
    
    <div v-if="store.isLoading" class="text-center">{{ $t('loading') }}</div>
    
    <div v-else-if="store.contractors.length === 0" class="text-center text-gray-500">
      Нет данных
    </div>

    <ul v-else class="divide-y divide-gray-200">
      <li v-for="contractor in store.contractors" :key="contractor.id" class="p-4 flex justify-between items-center hover:bg-gray-50">
        <NuxtLink :to="localePath(`/contractors/${contractor.id}`)" class="flex-grow">
          <span class="font-medium">{{ contractor.name }}</span>
          <span class="text-sm text-gray-500 ml-2">(ID: {{ contractor.id }})</span>
        </NuxtLink>
        <div class="flex items-center space-x-2">
          <NuxtLink :to="localePath(`/contractors/${contractor.id}/edit`)" class="text-green-600 hover:text-green-800">
            <Pencil class="w-5 h-5"/>
          </NuxtLink>
          <button @click="confirmDelete(contractor.id)" class="text-red-600 hover:text-red-800">
            <Trash2 class="w-5 h-5"/>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useContractorsStore } from '~/stores/contractors';
import { Pencil, Trash2 } from 'lucide-vue-next'; // Пример иконок

const localePath = useLocalePath();
const store = useContractorsStore();
const { t } = useI18n();

// Запрашиваем данные при первой загрузке компонента
// useAsyncData гарантирует, что это сработает и на сервере, и на клиенте
const { data, pending, error, refresh } = await useAsyncData(
  'contractors-list',
  () => store.fetchContractors()
);

function confirmDelete(id) {
  // Простое подтверждение через браузер. Можно заменить на красивый модал.
  if (window.confirm('Вы уверены, что хотите удалить этого контрагента?')) {
    store.deleteContractor(id);
  }
}
</script>