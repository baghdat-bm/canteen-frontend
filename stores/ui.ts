import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    isSidebarOpen: true,
    // --- НОВОЕ: Состояние для уведомления ---
    notification: {
      show: false,
      message: '',
      type: 'info', // 'info', 'success', 'warning', 'error'
    },
    notificationTimer: null,
  }),
  actions: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },

    /**
     * Показывает уведомление.
     * @param {object} payload - Параметры уведомления.
     * @param {string} payload.message - Текст сообщения.
     * @param {string} [payload.type='info'] - Тип уведомления ('info', 'success', 'warning', 'error').
     * @param {number} [payload.duration=5000] - Длительность показа в миллисекундах.
     */
    showNotification({ message, type = 'info', duration = 5000 }) {
      // Если уже есть активный таймер, сбрасываем его
      if (this.notificationTimer) {
        clearTimeout(this.notificationTimer);
      }

      this.notification.message = message;
      this.notification.type = type;
      this.notification.show = true;

      // Устанавливаем таймер на автоматическое скрытие
      this.notificationTimer = setTimeout(() => {
        this.hideNotification();
      }, duration);
    },

    /**
     * Скрывает уведомление.
     */
    hideNotification() {
      if (this.notificationTimer) {
        clearTimeout(this.notificationTimer);
        this.notificationTimer = null;
      }
      this.notification.show = false;
    },
  },
});
