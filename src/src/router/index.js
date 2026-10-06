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
	],
});
