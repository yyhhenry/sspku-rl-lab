import EditGridView from '@/views/EditGridView.vue'
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
      path: '/edit-grid',
      name: 'Edit Grid',
      component: EditGridView,
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
