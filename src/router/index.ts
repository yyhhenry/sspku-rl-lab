import EnvironmentView from '@/views/EnvironmentView.vue'
import SettingsView from '@/views/SettingsView.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import EditPolicyView from '../views/EditPolicyView.vue'
import HomeView from '../views/HomeView.vue'

// Async loading causes lag on Cloudflare Pages, so we use direct imports here

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/environment',
      name: 'Environment',
      component: EnvironmentView,
    },
    {
      path: '/edit-policy',
      name: 'Edit Policy',
      component: EditPolicyView,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsView,
    },
  ],
})

export default router
