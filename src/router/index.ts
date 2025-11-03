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
      name: 'EditGrid',
      component: () => import('../views/EditGridView.vue'),
    },
    {
      path: '/manual-policy',
      name: 'ManualPolicy',
      component: () => import('../views/ManualPolicyView.vue'),
    },
    {
      path: '/random-policy',
      name: 'RandomPolicy',
      component: () => import('../views/RandomPolicyView.vue'),
    },
    {
      path: '/closed-form-solution',
      name: 'ClosedFormSolution',
      component: () => import('../views/ClosedFormSolutionView.vue'),
    },
    {
      path: '/iterative-solution',
      name: 'IterativeSolution',
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
