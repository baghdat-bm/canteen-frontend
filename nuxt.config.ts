export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
  ],

  pinia: {
    storesDirs: ['./stores/**'],
  },

  i18n: {
    locales: [
      {
        code: 'kz',
        iso: 'kk-KZ',
        name: 'Қазақша',
        file: 'kz.json',
      },
      {
        code: 'ru',
        iso: 'ru-RU',
        name: 'Русский',
        file: 'ru.json',
      }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'kz', // Язык по умолчанию - казахский
    strategy: 'no_prefix', // Не добавлять префикс языка в URL для языка по умолчанию
    vueI18n: './i18n.config.ts' // Путь к файлу конфигурации i18n
  },

  // Добавим алиас для удобного импорта
  alias: {
    '@': '/<rootDir>',
  },

  // настройки приложения
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000', // URL бэкенда
    }
  },
})