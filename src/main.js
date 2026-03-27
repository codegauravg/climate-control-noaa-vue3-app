import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
// VULN [10110][40026]: imported for thesis ZAP demonstration — see src/utils/domUtils.js
import { renderSearchLabel } from './utils/domUtils.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

// VULN [40026]: runs on every page load, source = URL ?q= param, sink = innerHTML
renderSearchLabel('search-label')