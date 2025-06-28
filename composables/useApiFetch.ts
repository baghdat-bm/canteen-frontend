import type { UseFetchOptions } from '#app'
import { defu } from 'defu'
import { useAuthStore } from '~/stores/auth'

export function useApiFetch<T>(url: string, options: UseFetchOptions<T> = {}) {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()

    const defaults: UseFetchOptions<T> = {
        baseURL: 'https://api.your-backend.com/v1' as string, // !!! УКАЖИТЕ URL ВАШЕГО БЭКЕНДА
        // initialCache: false, // Отключить кэширование, если работаете с динамическими данными

        // Добавляем токен в заголовки
        headers: authStore.accessToken
            ? { Authorization: `Bearer ${authStore.accessToken}` }
            : {},

        // Обработчик ответа
        onResponse({ response }) {
            // Здесь можно обработать успешный ответ, если нужно
        },

        // Обработчик ошибки
        async onResponseError({ request, response, options }) {
            // Если ошибка 401 (Unauthorized)
            if (response.status === 401) {
                console.log('Получен 401, пытаемся обновить токен...');

                const success = await authStore.refreshAccessToken();

                if (success) {
                    // Если токен успешно обновлен, повторяем оригинальный запрос с новым токеном
                    console.log('Токен обновлен, повторяем запрос...');
                    options.headers = { ...options.headers, Authorization: `Bearer ${authStore.accessToken}` }
                    return useFetch(request, options)
                } else {
                    // Если обновить токен не удалось, разлогиниваем
                    console.log('Не удалось обновить токен, разлогиниваем.');
                    authStore.logout();
                }
            }
        },
    }

    // Объединяем дефолтные опции с переданными
    const params = defu(options, defaults)

    return useFetch(url, params)
}