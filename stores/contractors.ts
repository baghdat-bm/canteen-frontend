import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '~/utils/apiClient'

// Определяем интерфейс для нашего контрагента
export interface Contractor {
    id: number;
    name: string;
    bik: string;
    bank: string;
    corr_account: string;
    check_account: string;
}

export const useContractorsStore = defineStore('contractors', () => {
    // --- State ---
    // Список всех контрагентов
    const contractors = ref<Contractor[]>([]);
    // Время последнего запроса для кэширования
    const lastFetched = ref<Date | null>(null);
    // Состояние загрузки
    const isLoading = ref(false);

    // --- Getters ---
    // Геттер для получения одного контрагента по ID из списка
    const getContractorById = computed(() => {
        return (id: number) => contractors.value.find(c => c.id === id);
    });

    // --- Actions ---

    /**
     * Получает список контрагентов с кэшированием на 15 минут
     */
    async function fetchContractors() {
        const CACHE_DURATION = 15 * 60 * 1000; // 15 минут в миллисекундах

        // Если данные уже загружены и кэш не протух, ничего не делаем
        if (lastFetched.value && (new Date().getTime() - lastFetched.value.getTime() < CACHE_DURATION)) {
            console.log('Загрузка контрагентов из кэша Pinia.');
            return;
        }

        console.log('Кэш устарел, загрузка контрагентов с сервера...');
        isLoading.value = true;
        try {
            const data = await apiClient<Contractor[]>('/contractors/');
            contractors.value = data;
            lastFetched.value = new Date(); // Обновляем время последнего запроса
        } catch (error) {
            console.error("Ошибка при загрузке контрагентов:", error);
            // Здесь можно добавить обработку ошибок, например, всплывающее уведомление
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Создает нового контрагента
     */
    async function createContractor(data: Omit<Contractor, 'id'>) {
        try {
            const newContractor = await apiClient<Contractor>('/contractors/', {
                method: 'POST',
                body: data,
            });
            // Добавляем нового контрагента в начало списка для мгновенного отклика
            contractors.value.unshift(newContractor);
            // или можно сбросить кэш и перезапросить весь список:
            // lastFetched.value = null;
            // await fetchContractors();
        } catch (error) {
            console.error("Ошибка при создании контрагента:", error);
            throw error; // Пробрасываем ошибку, чтобы компонент мог ее обработать
        }
    }

    /**
     * Обновляет существующего контрагента
     */
    async function updateContractor(id: number, data: Partial<Omit<Contractor, 'id'>>) {
        try {
            const updatedContractor = await apiClient<Contractor>(`/contractors/${id}/`, {
                method: 'PATCH',
                body: data,
            });
            // Находим и обновляем контрагента в нашем локальном списке
            const index = contractors.value.findIndex(c => c.id === id);
            if (index !== -1) {
                contractors.value[index] = updatedContractor;
            }
        } catch (error) {
            console.error(`Ошибка при обновлении контрагента ${id}:`, error);
            throw error;
        }
    }

    /**
     * Удаляет контрагента
     */
    async function deleteContractor(id: number) {
        try {
            await apiClient(`/contractors/${id}/`, {
                method: 'DELETE',
            });
            // Удаляем контрагента из локального списка для мгновенного отклика
            contractors.value = contractors.value.filter(c => c.id !== id);
        } catch (error) {
            console.error(`Ошибка при удалении контрагента ${id}:`, error);
            throw error;
        }
    }

    return {
        contractors,
        isLoading,
        getContractorById,
        fetchContractors,
        createContractor,
        updateContractor,
        deleteContractor,
    };
});