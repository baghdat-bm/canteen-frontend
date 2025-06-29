import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '~/utils/apiClient'; 
import { useLocalePath } from '#i18n' 

// Интерфейсы оставляем без изменений
interface TokenResponse {
    refresh: string;
    access: string;
}
interface RefreshResponse {
    access: string;
}
interface UserProfile {
    user_id: number;
    profile_id: number;
    login: string;
    user_name: string;
    user_phone: string;
    school_id: number;
    school_bin: number;
    school_name_kz: string;
    school_name_ru: string;
    warehouse_id: number;
    warehouse_name: string;
}

export const useAuthStore = defineStore('auth', () => {

    const config = useRuntimeConfig();
    const router = useRouter();

    // State    
    const accessToken = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);
    const userProfile = ref<UserProfile | null>(null);


    const { locale } = useNuxtApp().$i18n;
    const localePath = useLocalePath();

    // Getters
    const isAuthenticated = computed(() => !!accessToken.value && !!userProfile.value);
    const getUserName = computed(() => userProfile.value?.user_name || 'Пайдаланушы');
    const warehouseName = computed(() => {
        // Если профиль еще не загружен, показываем значение по умолчанию
        if (!userProfile.value) {
            return ''; 
        }
        // В зависимости от локали возвращаем нужное поле
        return ' - ' + userProfile.value.warehouse_name;
    });
    const schoolName = computed(() => {
        // Если профиль еще не загружен, показываем значение по умолчанию
        if (!userProfile.value) {
            return locale.value === 'kz' ? 'Мектеп' : 'Школа'; 
        }
        // В зависимости от локали возвращаем нужное поле
        return locale.value === 'kz'
            ? userProfile.value.school_name_kz
            : userProfile.value.school_name_ru;
    });

    // Actions
    async function login(credentials: { login: string; password: string }) {

        try {
            const tokens = await $fetch<TokenResponse>(`/token/`, {
                baseURL: config.public.apiBase,
                method: 'POST',
                body: {
                    username: credentials.login,
                    password: credentials.password,
                },
            });

            setTokens(tokens.access, tokens.refresh);
            await fetchUser(credentials.login);
            await router.push(localePath('/'));

        } catch (error: any) {
            console.error('Ошибка входа:', error.data);
            throw new Error(error.data?.detail || 'Неверный логин или пароль');
        }
    }

    async function fetchUser(login: string) {
        try {
            const profile = await apiClient<UserProfile>('/user-data/');
            
            profile.login = login;

            // Вместо заполнения нескольких ref, мы просто сохраняем весь объект
            userProfile.value = profile;

        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            await logout();
            throw error;
        }
    }

    async function refreshAccessToken() {
        
        if (!refreshToken.value) return false;
        try {
            console.log('Обновление токена...');
            const response = await $fetch<RefreshResponse>(`/token/refresh/`, {
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
        userProfile.value = null; // <-- Очищаем профиль
        accessToken.value = null;
        refreshToken.value = null;
        await router.push(localePath('/login'));
    }

    return {
        userProfile,
        accessToken,
        refreshToken,
        schoolName,
        warehouseName,
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