import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dialog, Notify } from 'quasar'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'
import './style.css'
import './plugins/chart'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Quasar, {
  plugins: { Dialog, Notify },
  config: { notify: { position: 'top-right' } },
})

// Resolve auth session before mounting so router guards have state on first navigation
const auth = useAuthStore()
auth.initialize().finally(() => {
  app.mount('#app')
})
