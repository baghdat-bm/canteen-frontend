import { useAuthStore } from '~/stores/auth';
import type { FetchOptions } from 'ofetch';
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';

// Интерфейс для ответа API с пагинацией
export interface PaginatedResponse<T> {
    count: number; // Общее количество записей
    next: string | null;
    previous: string | null;
    results: T[];
}

type ApiBaseKey = 'common' | 'refs' | 'docs' | 'reports';

export function resolveBaseURL(key: ApiBaseKey) {
    const config = useRuntimeConfig();
    const host = config.public.apiHost;
    const map: Record<ApiBaseKey, string> = {
        common: `${host}${config.public.apiPathCommon}`,
        refs: `${host}${config.public.apiPathRefs}`,
        docs: `${host}${config.public.apiPathDocs}`,
        reports: `${host}${config.public.apiPathReports}`,
    };
    return map[key];
}

async function apiClient<T = any>(
    key: ApiBaseKey,
    url: NitroFetchRequest,
    options: NitroFetchOptions<NitroFetchRequest> = {}
): Promise<T> {

    const authStore = useAuthStore();

    // Клонируем и добавляем базовые настройки
    const customOptions: NitroFetchOptions<NitroFetchRequest> = {
        ...options,
        baseURL: resolveBaseURL(key),
        headers: { ...(options.headers as any) },
    };

    if (authStore.accessToken) {
        (customOptions.headers as any)['Authorization'] = `Bearer ${authStore.accessToken}`;
    }

    // Нормализуем метод: 'POST' -> 'post'
    if (customOptions.method) {
        customOptions.method = customOptions.method.toLowerCase() as typeof customOptions.method;
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
                (customOptions.headers as any).Authorization = `Bearer ${authStore.accessToken}`;

                // И просто повторяем тот же самый запрос еще раз
                return await $fetch<T>(url, customOptions);
            }
        }

        // Если обновить токен не удалось или ошибка была другая - пробрасываем ее дальше
        throw error;
    }
}

export const api = {
    common: <T = any>(url: NitroFetchRequest, options?: NitroFetchOptions<NitroFetchRequest>) =>
        apiClient<T>('common', url, options),
    refs: <T = any>(url: NitroFetchRequest, options?: NitroFetchOptions<NitroFetchRequest>) =>
        apiClient<T>('refs', url, options),
    docs:   <T = any>(url: NitroFetchRequest, options?: NitroFetchOptions<NitroFetchRequest>) =>
        apiClient<T>('docs', url, options),
    reports:<T = any>(url: NitroFetchRequest, options?: NitroFetchOptions<NitroFetchRequest>) =>
        apiClient<T>('reports', url, options),
};