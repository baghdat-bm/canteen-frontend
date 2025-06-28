import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
    // Получаем доступ к Pinia store
    const authStore = useAuthStore();

    // Если пользователь не аутентифицирован и пытается зайти не на страницу логина
    if (!authStore.isAuthenticated && to.path !== '/login') {
        // Перенаправляем его на страницу логина
        return navigateTo('/login');
    }

    // Если пользователь аутентифицирован и пытается зайти на страницу логина
    if (authStore.isAuthenticated && to.path === '/login') {
        // Перенаправляем его на главную страницу
        return navigateTo('/');
    }
});