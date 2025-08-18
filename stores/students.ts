import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {api, type PaginatedResponse} from '~/utils/apiClient'
import {useUiStore} from './ui.js';

// Определяем интерфейс для нашего контрагента
export interface Student {
    id: number;
    name: string;
    bin?: string;
    bik?: string;
    bank?: string;
    corr_account?: string;
    check_account?: string;
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
        name: '',
        bin: '',
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
        searchQuery.value = { name: '', bin: '', id: '' };
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
            if (searchQuery.value.name) {
                params.append('name', searchQuery.value.name);
            }
            if (searchQuery.value.bin) {
                params.append('bin', searchQuery.value.bin);
            }
            if (searchQuery.value.id) {
                params.append('id', searchQuery.value.id);
            }

            if (params.size == 0) {
                params.append('page', page.toString());
                params.append('page_size', pageSize.value.toString());
            }

            // console.log(`contractors request params: ${params}`);
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

    /**
     * Создает нового учащегося
     */
    async function createRecord(data: Omit<Student, 'id'>) {
        const uiStore = useUiStore(); 
        try {
            const newStudent = await api.refs<Student>('/students/', {
                method: 'post',
                body: data,
            });
            // Добавляем нового контрагента в начало списка для мгновенного отклика
            students.value.unshift(newStudent);
            // или можно сбросить кэш и перезапросить весь список:
            // lastFetched.value = null;
            // await fetchContractors();
        } catch (error) {            
            const errText = "Ошибка при создании учащегося";
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }

    /**
     * Обновляет существующего контрагента
     */
    async function updateRecord(id: number, data: Partial<Omit<Student, 'id'>>) {
        const uiStore = useUiStore(); 
        try {
            const updatedStudent = await api.refs<Student>(`/students/${id}/`, {
                method: 'patch',
                body: data,
            });
            // Находим и обновляем контрагента в нашем локальном списке
            const index = students.value.findIndex(c => c.id === id);
            if (index !== -1) {
                students.value[index] = updatedStudent;
            }
        } catch (error) {            
            const errText = `Ошибка при обновлении учащегося ${id}`;
            console.error(errText, error);
            uiStore.showNotification({
                message: errText,
                type: 'error',
                duration: 7000
            });
        }
    }

    /**
     * Удаляет контрагента
     */
    async function deleteRecord(id: number) {

        const uiStore = useUiStore();        
        const nuxtApp = useNuxtApp();        
        const { t } = nuxtApp.$i18n;

        try {
            await api.refs(`/students/${id}/`, { method: 'delete' });
            // Удаляем контрагента из локального списка для мгновенного отклика
            students.value = students.value.filter(c => c.id !== id);
            uiStore.showNotification({
                message: t('student.itemDeleted'),
                type: 'success',
            });
            return true;
        } catch (error) {
            console.error(`Ошибка при удалении контрагента ${id}:`, error);
            uiStore.showNotification({
                message: t('contractor.errorOnDelete'),
                type: 'error',
                duration: 7000
            });
            return false;
        }
    }

    return {
        contractors: students,
        contractor: student,
        isLoading,
        totalRecords,
        pageSize,
        currentPage,
        totalPages,
        searchQuery,
        getContractorById: getStudentById,
        fetchRecords,
        fetchRecord,
        createRecord,
        updateRecord,
        deleteRecord,
        reset,
    };
});