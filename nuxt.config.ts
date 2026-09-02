// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  ssr: false, // SPA Mode for smooth real-time web game rendering

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  app: {
    head: {
      title: 'مجابيد — ورق المجالس... كِل ولا تنكِل',
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
        { name: 'description', content: 'لعبة ورق جماعية أونلاين 2 ضد 2 — مجابيد (424 ورقة، أبراج، كمين الجوكر)' },
        { name: 'theme-color', content: '#07130c' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;900&display=swap' },
      ],
    },
  },

  css: [
    '~/assets/css/main.css',
  ],
})
