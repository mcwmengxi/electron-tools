import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import useConfig from '@/hooks/useConfig'
import i18n from '@/languages/i18n'

const app = createApp(App)
const { getConfig } = useConfig()
const config = getConfig()
console.log('主题配置', config)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
