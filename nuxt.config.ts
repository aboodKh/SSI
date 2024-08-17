export default defineNuxtConfig({
  modules: [
    [
      '@nuxtjs/google-fonts',
      {
        families: {
          Roboto: true,
          Lato: [400, 500, 600, 700],
        },
      },
    ],
    '@nuxt/ui',
  ],
  runtimeConfig: {
    PARADYM_API_KEY: process.env.PARADYM_API_KEY,
    public: {
      PARADYM_PROJECT_ID: process.env.PARADYM_PROJECT_ID,
      PARADYM_TEMPLATE_ID: process.env.PARADYM_TEMPLATE_ID,
      PARADYM_PRESENTATION_TEMPLATE_ID: process.env.PARADYM_PRESENTATION_TEMPLATE_ID,
      PARADYM_URL: `https://api.paradym.id/v1/projects/${process.env.PARADYM_PROJECT_ID}`,
      LOGIN_WORKFLOW_ID: process.env.LOGIN_WORKFLOW_ID,
      SIGN_UP_WORKFLOW_ID: process.env.SIGN_UP_WORKFLOW_ID,
    },
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
