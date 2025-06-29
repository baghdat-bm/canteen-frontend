import { useAuthStore } from '~/stores/auth';
import type { UseFetchOptions } from 'ofetch';

/**
 * Эта обертка над useFetch нужна для получения данных, 
 * необходимых для отрисовки страницы на СЕРВЕРЕ (SSR).
 * Например, для загрузки списка меню на странице /menu.
 */
export const useApiFetch = <T>(url: string, options: UseFetchOptions<T> = {}) => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();

    const defaults: UseFetchOptions<T> = {
        baseURL: config.public.apiBase,

        // Добавляем токен, если он есть. 
        // При генерации на сервере Pinia уже будет инициализирована,
        // и токен из cookie будет доступен.
        headers: authStore.accessToken
            ? { Authorization: `Bearer ${authStore.accessToken}` }
            : {},
    };

    // Мы просто вызываем useFetch, добавляя в него наши стандартные опции
    return useFetch(url, { ...defaults, ...options });
}