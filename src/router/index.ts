import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
      component: () => import('../views/EditGridView.vue'),
    },
    {
      path: '/edit-policy',
      name: 'Edit Policy',
      component: () => import('../views/EditPolicyView.vue'),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
})

export default router
