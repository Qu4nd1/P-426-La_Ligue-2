import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TournamentCreation from '../views/TournamentCreation.vue';
const router = createRouter({
	history: createWebHistory(),
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
			component: TournamentCreation,
		}
	],
});
