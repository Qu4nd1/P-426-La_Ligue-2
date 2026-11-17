import TeamSignUp from "../../views/TeamSignUp.vue";
import TournamentView from "../../views/TournamentView.vue";

export default [
  {
    path: "/team-signup/:tournamentId",
    name: "team-signup",
    component: TeamSignUp,
  },
  {
    path: "/tournoi/:tournamentId",
    name: "tournoi",
    component: TournamentView,
  },
];
