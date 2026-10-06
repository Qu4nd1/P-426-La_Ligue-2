import { createRouter, createWebHistory } from 'vue-router'
import TournamentCreation from '@/views/TournamentCreation.vue'
import App from '@/App.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: App,
    },
    {
      path: '/TournamentCreation',
      name: 'tournament-creation',
      component: TournamentCreation,
    },
  ],
})

export default router
