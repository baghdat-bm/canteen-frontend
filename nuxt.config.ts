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
    strategy: 'prefix_except_default',
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
    
    vueI18n: './i18n.config.ts', // Путь к файлу конфигурации i18n
    detectBrowserLanguage: {
      useCookie: true,              // Оставляем включенным
      cookieKey: 'app_locale',      // Используем то же имя cookie
      
      // ВАЖНО: Мы отключаем "агрессивный" редирект.
      // Теперь Nuxt не будет пытаться перенаправить вас при каждом удобном случае.
      // Он будет доверять cookie и префиксу в URL.
      alwaysRedirect: false,
      
      // Перенаправлять, только если пользователь зашел на страницу без языкового префикса.
      // Например, если он зайдет на my-site.com/ (вместо my-site.com/kz),
      // то Nuxt посмотрит в cookie и перенаправит на my-site.com/kz/.
      redirectOn: 'no prefix',  
    }
  },

  // Добавим алиас для удобного импорта
  alias: {
    '@': '/<rootDir>',
  },

  // настройки приложения
  runtimeConfig: {
    public: {
        // общий хост (dev/prod/stage)
        apiHost: process.env.NUXT_PUBLIC_API_HOST || 'http://localhost:8000',
        // префиксы путей
        apiPathRefs: process.env.NUXT_PUBLIC_API_PATH_SCHOOL || '/ru/school-api',
        apiPathDocs: process.env.NUXT_PUBLIC_API_PATH_FOOD || '/ru/food-api',
        apiPathReports: process.env.NUXT_PUBLIC_API_PATH_REPORTS || '/ru/reports-api',
    }
  },
})