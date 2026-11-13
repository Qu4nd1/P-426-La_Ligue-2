import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/login.vue";
import TeamsView from "../views/teams.vue";
import TournamentCreation from "../views/TournamentCreation.vue";
import NotFoundView from "../views/NotFound.vue";
import { connectedUser } from "../stores/userStore.js";
import homeRoutes from "./routes/home.route.js";
import tournoiRoutes from "./routes/tournoi.routes.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) {
      const target = document.getElementById(to.hash.slice(1));
      if (target) return { el: target };
    }
    return { top: 0 };
  },
  routes: [
    ...homeRoutes,
    ...tournoiRoutes,
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },

    {
      path: "/teams",
      name: "teams",
      component: TeamsView,
      meta: { adminOnly: true },
    },

    {
      path: "/tournament-creation",
      name: "tournament-creation",
      component: TournamentCreation,
      meta: { adminOnly: true },
    },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView },
  ],
});

router.beforeEach((to) => {
  if (to.name === "login" && connectedUser.connected) {
    return { name: "home" };
  }
  if (to.meta.adminOnly) {
    if (!connectedUser.connected) {
      return { name: "login", query: { redirect: to.name } };
    }
    if (connectedUser.role !== "admin") return { name: "home" };
  }
});

export default router;
