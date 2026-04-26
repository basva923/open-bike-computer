import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/settings', component: SettingsView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
