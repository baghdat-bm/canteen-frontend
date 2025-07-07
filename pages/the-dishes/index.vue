<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Блюда</h1>
      <NuxtLink to="/the-dishes/create">
        <button class="bg-blue-500 text-white px-4 py-2 rounded">Создать блюдо</button>
      </NuxtLink>
    </div>

    <div v-if="categoriesStore.isLoading" class="text-center">
      <p>Загрузка категорий...</p>
    </div>

    <div v-else-if="categoriesStore.error" class="text-center text-red-500">
      <p>Ошибка при загрузке категорий: {{ categoriesStore.error }}</p>
    </div>

    <div v-else class="border">
      <div v-for="(categoryGroup, index) in dishGroups" :key="categoryGroup.category.id"
           :class="{ 'border-t': index > 0 }">

        <div @click="toggleCategory(categoryGroup)"
             class="flex items-stretch bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">

          <div class="w-10 flex-shrink-0" :style="{ backgroundColor: categoryGroup.category.color }"></div>

          <div class="flex-grow flex items-center justify-between p-3">
            <h2 class="text-lg font-semibold">{{ categoryGroup.category.name_ru }}</h2>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-auto transition-transform"
                 :class="{ 'rotate-180': categoryGroup.isOpen }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <div v-if="categoryGroup.isOpen">
          <div v-if="categoryGroup.loading" class="text-center p-4">
            <p>Загрузка блюд...</p>
          </div>
          <div v-else-if="categoryGroup.error" class="text-center p-4 text-red-500">
            <p>Ошибка при загрузке блюд: {{ categoryGroup.error }}</p>
          </div>
          <div v-else-if="categoryGroup.dishes.length === 0" class="text-center p-4 text-gray-500">
            <p>В этой категории нет блюд.</p>
          </div>
          <ul v-else class="bg-white">
            <li v-for="dish in categoryGroup.dishes" :key="dish.id" class="border-t cursor-pointer" @click="viewRecord(dish.id)">
              <div class="flex items-center justify-between p-3 hover:bg-gray-100">
                <div class="font-medium">
                  {{ dish.name_ru }}
                </div>

                <div class="flex items-center space-x-4">
                  <NuxtLink :to="`/the-dishes/${dish.id}/edit`" title="Изменить" class="text-indigo-600 hover:text-indigo-400 transition-colors">
                    <Pencil class="h-5 w-5" />
                  </NuxtLink>

                  <button @click="confirmDelete(dish)" title="Удалить" class="text-red-600 hover:text-red-400 transition-colors cursor-pointer">
                    <Trash2 class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal"
         class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Подтвердите удаление</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Вы уверены, что хотите удалить блюдо "{{ dishToDelete?.name_ru }}"?
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button @click="deleteDishConfirmed"
                    class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">
              Удалить
            </button>
            <button @click="showDeleteModal = false"
                    class="ml-3 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDishStore, type Dish } from '~/stores/dishes';
import { useDishCategoriesStore, type DishCategory } from '~/stores/dishCategories';
import { Pencil, Trash2 } from 'lucide-vue-next';

interface DishGroup {
  category: DishCategory;
  dishes: Dish[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

const router = useRouter();
const dishesStore = useDishStore();
const categoriesStore = useDishCategoriesStore();

const dishGroups = ref<DishGroup[]>([]);
const showDeleteModal = ref(false);
const dishToDelete = ref<Dish | null>(null);
const localePath = useLocalePath();

onMounted(async () => {
  categoriesStore.pageSize = 999;
  await categoriesStore.fetchRecords();

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
    categoryGroup.error = null;
    try {
      await dishesStore.fetchDishes(categoryGroup.category.id);
      categoryGroup.dishes = [...dishesStore.dishes];
    } catch (e) {
      categoryGroup.error = 'Не удалось загрузить блюда.';
      console.error(e);
    } finally {
      categoryGroup.loading = false;
    }
  }
};

function viewRecord(id: number) {
  router.push(localePath(`/the-dishes/${id}`));
}

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
  showDeleteModal.value = false;
  dishToDelete.value = null;
};
</script>