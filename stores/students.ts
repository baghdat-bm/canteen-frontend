import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {api, type PaginatedResponse} from '~/utils/apiClient'
import {useUiStore} from './ui.js';

// Определяем интерфейс для учащегося
export interface Student {
    id: number;
    full_name: string;
    iin?: string;
    phone?: string;
    birthday?: string;
    class_number?: string;
    personal_account?: string;
    photo: string;
    balance: number;
}

export const useStudentsStore = defineStore('students', () => {
    // --- State ---    
    const students = ref<Student[]>([]);
    const student = ref<Student | null>(null);
    const isLoading = ref(false);

    // --- Состояние для пагинации и поиска ---
    const totalRecords = ref(0);
    const pageSize = ref(30); // 30 записей на страницу
    const currentPage = ref(1);
    const searchQuery = ref({
        full_name: '',
        iin: '',
        id: ''
    });

    // --- Getters ---
    const totalPages = computed(() => {
        if (totalRecords.value === 0) return 1;
        return Math.ceil(totalRecords.value / pageSize.value);
    });
    
    const getStudentById = computed(() => {
        return (id: number) => students.value.find(c => c.id === id);
    });

    // --- Actions ---
    function reset() {
        students.value = [];
        student.value = null;
        isLoading.value = false;
        totalRecords.value = 0;
        currentPage.value = 1;
        searchQuery.value = { full_name: '', iin: '', id: '' };
    }

    /**
     * Получает список студентов с учетом пагинации и поиска
     * @param {number} page - Номер страницы для загрузки
     */
    async function fetchRecords(page: number = 1) {
        const uiStore = useUiStore();
        isLoading.value = true;
        currentPage.value = page;

        try {
            // Используем URLSearchParams для удобного формирования query-параметров
            const params = new URLSearchParams();

            // Добавляем параметры поиска, если они не пустые
            if (searchQuery.value.full_name) {
                params.append('full_name', searchQuery.value.full_name);
            }
            if (searchQuery.value.iin) {
                params.append('iin', searchQuery.value.iin);
            }
            if (searchQuery.value.id) {
                params.append('id', searchQuery.value.id);
            }

            if (params.size == 0) {
                params.append('page', page.toString());
                params.append('page_size', pageSize.value.toString());
            }

            const urlStr = `/students/?${params.toString()}`;
            // console.log(`urlStr: ${urlStr}`);
            const response = await api.refs<PaginatedResponse<Student>>(urlStr, { method: 'get' });

            students.value = response.results;
            totalRecords.value = response.count;

        } catch (error) {
            const errText = "Ошибка при загрузке учащихся";
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * --- Получение одной записи по ID ---
     */
    async function fetchRecord(id: number) {
        const uiStore = useUiStore();
        const { t } = useNuxtApp().$i18n;
        isLoading.value = true;
        student.value = null; // Очищаем предыдущее значение

        try {
            student.value = await api.refs<Student>(`/students/${id}/`, { method: 'get' });
        } catch (error) {
            console.error(`Failed to fetch student with id ${id}:`, error);
            uiStore.showNotification({
                message: t('messages.fetchErrorItem'),
                type: 'error',
            });
        } finally {
            isLoading.value = false;
        }
    }


    return {
        students,
        student,
        isLoading,
        totalRecords,
        pageSize,
        currentPage,
        totalPages,
        searchQuery,
        getStudentById,
        fetchRecords,
        fetchRecord,
        reset,
    };
});