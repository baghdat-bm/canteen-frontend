<template>
    <!-- 
    Простой и красивый спиннер, созданный с помощью Tailwind CSS.
    Вы можете настроить его размер, цвет и толщину, изменяя классы.
  -->
    <div role="status" class="flex justify-center items-center p-4">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-indigo-600"></div>
        <span class="sr-only">Loading...</span>
    </div>
</template>

<script setup>
// Для этого простого компонента скрипт не нужен
</script>
