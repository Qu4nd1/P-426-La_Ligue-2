import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/login.vue";
import TournamentCreation from "../views/TournamentCreation.vue";

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
		},
		{
			path: "/login",
			name: "login",
			component: LoginView,
		},
		{
			path:"/tournament-creation",
			name: "tournament-creation",
			component : TournamentCreation
		}
	],
});

export default router;
