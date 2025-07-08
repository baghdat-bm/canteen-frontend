import { useAuthStore } from '~/stores/auth';
import type { FetchOptions } from 'ofetch';

// Интерфейс для ответа API с пагинацией
export interface PaginatedResponse<T> {
    count: number; // Общее количество записей
    next: string | null;
    previous: string | null;
    results: T[];
}

export async function apiClient<T>(url: string, options: FetchOptions = {}) {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();

    const customOptions: FetchOptions = {
        ...options,
        baseURL: config.public.apiBase,
        headers: {
            ...options.headers,
        },
    };

    if (authStore.accessToken) {
        customOptions.headers!['Authorization'] = `Bearer ${authStore.accessToken}`;
    }

    try {
        return await $fetch<T>(url, customOptions);
    } catch (error: any) {
        // Проверяем, является ли ошибка 401 ИЛИ 403
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log(`Поймали ошибку ${error.response.status}. Пытаемся обновить токен...`);
            
            const refreshed = await authStore.refreshAccessToken();
            
            if (refreshed) {
                console.log('Токен обновлен. Повторяем оригинальный запрос...');
                // Обновляем заголовок с НОВЫМ токеном в наших кастомных опциях
                customOptions.headers!['Authorization'] = `Bearer ${authStore.accessToken}`;
                
                // И просто повторяем тот же самый запрос еще раз
                return await $fetch<T>(url, customOptions);
            }
        }

        // Если обновить токен не удалось или ошибка была другая - пробрасываем ее дальше
        throw error;
    }
}