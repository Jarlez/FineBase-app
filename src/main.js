import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dialog, Notify } from 'quasar'
import App from './App.vue'
import router from './router'

import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'
import './style.css'
import './plugins/chart'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: {
    Dialog,
    Notify,
  },
  config: {
    notify: {
      position: 'top-right',
    },
  },
})

app.mount('#app')
