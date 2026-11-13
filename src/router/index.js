import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/login.vue";
import TeamsView from "../views/teams.vue";
import TournamentCreation from "../views/TournamentCreation.vue";
import { connectedUser } from "../stores/userStore";
import RankingView from "../views/Classement.vue";

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
      path: "/teams",
      name: "teams",
      component: TeamsView,
      beforeEnter: () =>
        connectedUser.connected && connectedUser.role === "admin"
          ? true
          : { name: "home" },
    },
    {
      path: "/classement",
      name: "classement",
      component: RankingView,
      beforeEnter: () =>
        connectedUser.connected && connectedUser.role === "admin"
          ? true
          : { name: "home" },
    },
    {
      path: "/tournament-creation",
      name: "tournament-creation",
      component: TournamentCreation,
    },
  ],
});

export default router;
