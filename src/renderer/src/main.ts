import './assets/main.css'

import { createApp } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import { Button, List, Spin, Input, Avatar, Tag, Row, Col, Divider } from 'ant-design-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(Button).use(List).use(Spin).use(Input).use(Avatar).use(Tag).use(Row).use(Col).use(Divider)
app.mount('#app')
