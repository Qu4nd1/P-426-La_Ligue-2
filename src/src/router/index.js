import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TournamentCreation from '../views/TournamentCreation.vue';
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			component: HomeView,
		},
		{
			path: "/login",
			component: LoginView,
		},
		{
			path: '/tournament-creation',
			name: 'tournament-creation',
			component: TournamentCreation,
		}
	],
});
export default router
