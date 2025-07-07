<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{{ $t('dish.itemList') }}</h1>
      <NuxtLink to="/the-dishes/create">
        <button class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          {{ $t('create_new') }}
        </button>
      </NuxtLink>
    </div>

    <div v-if="categoriesStore.isLoading" class="text-center">
      <BaseSpinner/>
      <p class="mt-2 text-gray-600">{{ $t('loading') }}</p>
    </div>

    <div v-else class="border border-gray-200">
      <div v-for="(categoryGroup, index) in dishGroups" :key="categoryGroup.category.id"
           :class="{ 'border-t border-gray-200': index > 0 }">

        <div @click="toggleCategory(categoryGroup)"
             class="flex items-stretch bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">

          <div class="w-10 flex-shrink-0" :style="{ backgroundColor: categoryGroup.category.color }"></div>

          <div class="flex-grow flex items-center justify-between p-3">
            <h2 class="text-sm font-semibold">
              {{ locale === 'kz' ? categoryGroup.category.name_kz : categoryGroup.category.name_ru }}</h2>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-auto transition-transform"
                 :class="{ 'rotate-180': categoryGroup.isOpen }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <div v-if="categoryGroup.isOpen">
          <div v-if="categoryGroup.loading" class="text-center p-4">
            <BaseSpinner/>
            <p class="mt-2 text-gray-600">{{ $t('dish.loading') }}</p>
          </div>
          <div v-else-if="categoryGroup.dishes.length === 0" class="text-center p-4 text-gray-500">
            <p>{{ $t('dish.noData') }}</p>
          </div>

          <ul v-else class="bg-white">
            <li v-for="dish in categoryGroup.dishes" :key="dish.id"
                class="border-t group cursor-pointer border-gray-200">
              <div class="relative flex items-center justify-between p-3 hover:bg-blue-100 transition-colors">
                <NuxtLink :to="`/the-dishes/${dish.id}`" class="absolute inset-0 z-10" aria-label="Просмотр блюда"/>

                <span class="text-sm">
                  {{ locale === 'kz' ? dish.name_kz : dish.name_ru }}
                </span>

                <div class="relative z-20 flex items-center space-x-4">
                  <NuxtLink :to="`/the-dishes/${dish.id}/edit`" title="Изменить"
                            class="text-indigo-600 hover:text-indigo-400 transition-colors">
                    <Pencil class="h-5 w-5"/>
                  </NuxtLink>

                  <button @click="confirmDelete(dish)" title="Удалить"
                          class="text-red-600 hover:text-red-400 transition-colors cursor-pointer">
                    <Trash2 class="h-5 w-5"/>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="p-4">
      <ConfirmDialog v-model="showDeleteModal"
                     :title="$t('captions.confirmDelete')"
                     :message="$t('dish.confirmDelete')"
                     :confirm-button-text="$t('actions.delete')"
                     @confirm="deleteDishConfirmed"/>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {useI18n} from 'vue-i18n';
import BaseSpinner from '~/components/BaseSpinner.vue';
import ConfirmDialog from '~/components/ConfirmDialog.vue';
import {useDishStore, type Dish} from '~/stores/dishes';
import {useDishCategoriesStore, type DishCategory} from '~/stores/dishCategories';
import {Pencil, Trash2} from 'lucide-vue-next';

interface DishGroup {
  category: DishCategory;
  dishes: Dish[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

const dishesStore = useDishStore();
const categoriesStore = useDishCategoriesStore();
const {t, locale} = useI18n();

const dishGroups = ref<DishGroup[]>([]);
const showDeleteModal = ref(false);
const dishToDelete = ref<Dish | null>(null);

onMounted(async () => {
  categoriesStore.pageSize = 999;
  await categoriesStore.fetchRecords(1, locale.value);

  if (categoriesStore.dishCategories) {
    dishGroups.value = categoriesStore.dishCategories.map(category => ({
      category,
      dishes: [],
      isOpen: false,
      loading: false,
      error: null,
    }));
  }
});

const toggleCategory = async (categoryGroup: DishGroup) => {
  categoryGroup.isOpen = !categoryGroup.isOpen;

  if (categoryGroup.isOpen && categoryGroup.dishes.length === 0) {
    categoryGroup.loading = true;
    await dishesStore.fetchDishes(categoryGroup.category.id, locale.value);
    categoryGroup.dishes = [...dishesStore.dishes];
    categoryGroup.loading = false; // Устанавливаем в false после завершения
  }
};

const confirmDelete = (dish: Dish) => {
  dishToDelete.value = dish;
  showDeleteModal.value = true;
};

const deleteDishConfirmed = async () => {
  if (dishToDelete.value) {
    await dishesStore.deleteRecord(dishToDelete.value.id);
    const group = dishGroups.value.find(g => g.category.id === dishToDelete.value?.category);
    if (group) {
      group.dishes = group.dishes.filter(d => d.id !== dishToDelete.value?.id);
    }
  }
};
</script>