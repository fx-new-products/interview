export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    baseURL: process.env.BASE_URL || '/interview/',
    head: {
      title: '面談管理',
      htmlAttrs: { lang: 'ja' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;600;700;900&family=DM+Sans:wght@400;500;700&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    googleClientId: '',
    googleClientSecret: '',
    googleRefreshToken: '',
    calendarId: 'primary',
  },
  nitro: {
    externals: {
      external: ['kuroshiro', 'kuroshiro-analyzer-kuromoji', 'kuromoji'],
    },
    esbuild: {
      options: {
        target: 'node22',
      },
    },
  },
})
