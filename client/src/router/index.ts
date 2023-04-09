import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import ('../views/home.vue')
    },
    {
      path: '/account',
      name: 'accountLanding',
      children: [
        {
          path: '/sign-in',
          name: 'accountLandingSignIn',
          component: () => import('../views/account/sign-in.vue')
        },
        {
          path: '/sign-up',
          name: 'accountLandingSignUp',
          component: () => import('../views/account/sign-up.vue')
        },
        {
          path: '/change-pwd',
          name: 'accountLandingChangePwd',
          component: () => import('../views/account/change-pwd.vue')
        }
      ]
    }
  ]
})

export default router
