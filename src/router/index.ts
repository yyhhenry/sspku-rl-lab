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
      path: '/manual-policy',
      name: 'Manual Policy',
      component: () => import('../views/ManualPolicyView.vue'),
    },
    {
      path: '/closed-form-solution',
      name: 'Closed-Form Solution',
      component: () => import('../views/ClosedFormSolutionView.vue'),
    },
    {
      path: '/iterative-solution',
      name: 'Iterative Solution',
      component: () => import('../views/IterativeSolutionView.vue'),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
})

export default router
