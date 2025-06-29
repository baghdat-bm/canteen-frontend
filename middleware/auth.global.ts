import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();
    
    // Получаем доступ к хелперу для создания локализованных путей
    const localePath = useLocalePath();

    // Определяем, является ли целевой маршрут страницей логина
    // Мы используем to.name, так как to.path может содержать префикс языка
    const isLoginPage = String(to.name).startsWith('login');

    // Если пользователь не аутентифицирован и пытается зайти не на страницу логина
    if (!authStore.isAuthenticated && !isLoginPage) {
        // Перенаправляем его на локализованную версию страницы логина
        return navigateTo(localePath('/login'));
    }

    // Если пользователь аутентифицирован и пытается зайти на страницу логина
    if (authStore.isAuthenticated && isLoginPage) {
        // Перенаправляем его на локализованную версию главной страницы
        return navigateTo(localePath('/'));
    }
});