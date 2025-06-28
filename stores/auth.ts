import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApiFetch } from '~/composables/useApiFetch'

// Интерфейсы оставляем без изменений
interface TokenResponse {
    refresh: string;
    access: string;
}
interface RefreshResponse {
    access: string;
}
interface UserProfile {
    username: string;
    full_name: string;
    canteen: {
        name: string;
    }
}

export const useAuthStore = defineStore('auth', () => {
    // 1. Вызываем только те composable-функции, которые безопасно вызывать при инициализации.
    // useRuntimeConfig и useRouter, как правило, безопасны.
    const config = useRuntimeConfig();
    const router = useRouter();

    // УБИРАЕМ: const { locale } = useI18n(); - ЭТА СТРОКА ВЫЗЫВАЛА ОШИБКУ НА СЕРВЕРЕ

    // State
    const user = ref<{ name: string; login: string } | null>(null);
    const accessToken = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);
    const canteenName = ref<string>('Асхана');

    // Getters
    const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
    const getUserName = computed(() => user.value?.name || 'Пайдаланушы');

    // Actions
    async function login(credentials: { login: string; password: string }) {

        console.log('Данные, полученные для отправки:', credentials);

        // ПОЛУЧАЕМ ЛОКАЛЬ ЗДЕСЬ: Это безопасный способ для actions, работает и на сервере, и на клиенте.
        const { locale } = useNuxtApp().$i18n;

        try {
            const tokens = await $fetch<TokenResponse>(`/${locale.value}/school-api/token/`, {
                baseURL: config.public.apiBase,
                method: 'POST',
                body: {
                    username: credentials.login,
                    password: credentials.password,
                },
            });

            setTokens(tokens.access, tokens.refresh);
            await fetchUser();
            await router.push('/');

        } catch (error: any) {
            console.error('Ошибка входа:', error.data);
            throw new Error(error.data?.detail || 'Неверный логин или пароль');
        }
    }

    async function fetchUser() {
        try {
            const response = await useApiFetch<UserProfile>('/school-api/users/me/');

            if (!response.data.value) {
                throw new Error('Не удалось получить данные пользователя');
            }
            const userProfile = response.data.value;
            user.value = {
                name: userProfile.full_name,
                login: userProfile.username,
            };
            canteenName.value = userProfile.canteen.name;
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            await logout();
            throw error;
        }
    }

    async function refreshAccessToken() {
        // ПОЛУЧАЕМ ЛОКАЛЬ ЗДЕСЬ: Это безопасный способ для actions
        const { locale } = useNuxtApp().$i18n;

        if (!refreshToken.value) return false;
        try {
            console.log('Обновление токена...');
            const response = await $fetch<RefreshResponse>(`/${locale.value}/school-api/token/refresh/`, {
                baseURL: config.public.apiBase,
                method: 'POST',
                body: {
                    refresh: refreshToken.value,
                },
            });
            accessToken.value = response.access;
            console.log('Токен успешно обновлен.');
            return true;
        } catch (error: any) {
            console.error('Не удалось обновить токен:', error.data);
            await logout();
            return false;
        }
    }

    function setTokens(newAccessToken: string, newRefreshToken: string) {
        accessToken.value = newAccessToken;
        refreshToken.value = newRefreshToken;
    }

    async function logout() {
        user.value = null;
        accessToken.value = null;
        refreshToken.value = null;
        canteenName.value = 'Асхана';
        await router.push('/login');
    }

    return {
        user,
        accessToken,
        refreshToken,
        canteenName,
        isAuthenticated,
        getUserName,
        login,
        fetchUser,
        refreshAccessToken,
        logout,
    };
}, {
    persist: true,
});