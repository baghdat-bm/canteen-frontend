import { useAuthStore } from '~/stores/auth';
import type { FetchOptions } from 'ofetch';

export async function apiClient<T>(url: string, options: FetchOptions = {}) {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();

    // Создаем кастомные опции, чтобы не изменять оригинальный объект
    const customOptions: FetchOptions = {
        ...options,
        baseURL: config.public.apiBase,
        headers: {
            ...options.headers,
        },
    };

    // 1. Просто добавляем токен, если он есть
    if (authStore.accessToken) {
        customOptions.headers!['Authorization'] = `Bearer ${authStore.accessToken}`;
    }

    try {
        // 2. Выполняем обычный, понятный $fetch
        return await $fetch<T>(url, customOptions);
    } catch (error: any) {
        // 3. Если поймали ошибку 401, пытаемся ОДИН раз обновить токен
        if (error.response?.status === 401 && authStore.refreshToken) {
            console.log('Поймали 401. Пытаемся обновить токен...');
            
            const refreshed = await authStore.refreshAccessToken();
            
            if (refreshed) {
                console.log('Токен обновлен. Повторяем запрос...');
                // Обновляем заголовок с НОВЫМ токеном
                customOptions.headers!['Authorization'] = `Bearer ${authStore.accessToken}`;
                
                // И просто повторяем тот же самый запрос еще раз
                return await $fetch<T>(url, customOptions);
            }
        }

        // Если обновить токен не удалось или ошибка была другая - пробрасываем ее дальше
        throw error;
    }
}