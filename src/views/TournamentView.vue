<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { countAcceptedTeams, getTeams } from "../services/teams.js";
import {
  creerMatchs,
  decouperTours,
  enregistrerScoreMatch,
  formatTournamentDate,
  getMatchs,
  getTournoi,
  isTournamentFull,
} from "../services/tournoi.js";
import { connectedUser } from "../stores/userStore.js";

const tournamentId = String(useRoute().params.tournamentId);
const tournoi = ref(null);
const matchs = ref([]);
const nbEquipes = ref(0);
const loading = ref(true);
const erreur = ref("");
const scores = reactive({});
const erreursMatch = reactive({});
const enCours = reactive({});

const isAdmin = computed(
  () => connectedUser.connected && connectedUser.role === "admin",
);

const tours = computed(() =>
  decouperTours(matchs.value, nbEquipes.value || Number(tournoi.value?.nbTeam)),
);

const vainqueurTournoi = computed(() => {
  const dernierTour = tours.value[tours.value.length - 1];
  if (dernierTour?.length === 1 && dernierTour[0].winner) {
    return dernierTour[0].winner;
  }
  return null;
});

function initScores(listeMatchs) {
  for (const match of listeMatchs) {
    if (!scores[match.id]) {
      scores[match.id] = ["", ""];
    }
  }
}

function titreTour(index, tour) {
  if (tour.length === 1 && tours.value.length > 1) return "Finale";
  if (tour.length === 2 && tours.value.length > 1) return "Demi-finales";
  return `Tour ${index + 1}`;
}

async function validerScore(match) {
  erreursMatch[match.id] = "";
  const [raw1, raw2] = scores[match.id] ?? ["", ""];
  const score1 = Number(raw1);
  const score2 = Number(raw2);

  if (
    raw1 === "" ||
    raw2 === "" ||
    !Number.isFinite(score1) ||
    !Number.isFinite(score2) ||
    score1 < 0 ||
    score2 < 0
  ) {
    erreursMatch[match.id] = "Saisissez deux scores valides.";
    return;
  }

  if (score1 === score2) {
    erreursMatch[match.id] = "Égalité impossible.";
    return;
  }

  enCours[match.id] = true;
  try {
    matchs.value = await enregistrerScoreMatch(
      tournoi.value,
      match,
      score1,
      score2,
      nbEquipes.value || Number(tournoi.value.nbTeam),
    );
    initScores(matchs.value);
  } catch {
    erreursMatch[match.id] = "Impossible d'enregistrer le score.";
  } finally {
    enCours[match.id] = false;
  }
}

onMounted(async () => {
  try {
    tournoi.value = (await getTournoi(tournamentId)).data;
    const { data: teams } = await getTeams({
      tournamentId,
      status: "accepted",
    });
    nbEquipes.value = countAcceptedTeams(teams);
    if (isTournamentFull(tournoi.value, nbEquipes.value))
      await creerMatchs(tournoi.value);
    matchs.value = (await getMatchs(tournamentId)).data;
    initScores(matchs.value);
  } catch {
    erreur.value = "Impossible de charger ce tournoi.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="league-form">
    <p v-if="loading" class="info" role="status">Chargement du tournoi…</p>
    <p v-else-if="erreur" class="error" role="alert">{{ erreur }}</p>
    <template v-else>
      <h1>{{ tournoi.name }}</h1>
      <p class="info">
        {{ tournoi.game }} · {{ formatTournamentDate(tournoi.date) }}
        <br />
        Équipes acceptées · {{ nbEquipes }} / {{ tournoi.nbTeam }}
      </p>

      <h2>Matchs</h2>
      <p v-if="vainqueurTournoi" class="champion">
        Vainqueur du tournoi : {{ vainqueurTournoi }}
      </p>

      <div v-if="tours.length" class="tours">
        <div v-for="(tour, index) in tours" :key="index" class="tour">
          <h3 v-if="tours.length > 1" class="tour-title">
            {{ titreTour(index, tour) }}
          </h3>
          <div class="matchs">
            <article v-for="match in tour" :key="match.id" class="match">
              <div class="team-row">
                <span
                  class="equipe"
                  :class="{ 'equipe--winner': match.winner === match.teams[0] }"
                >
                  {{ match.teams[0] }}
                </span>
                <input
                  v-if="isAdmin && !match.winner"
                  v-model="scores[match.id][0]"
                  class="score-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  :aria-label="`Score de ${match.teams[0]}`"
                />
              </div>

              <span class="vs">VS</span>

              <div class="team-row">
                <span
                  class="equipe"
                  :class="{ 'equipe--winner': match.winner === match.teams[1] }"
                >
                  {{ match.teams[1] }}
                </span>
                <input
                  v-if="isAdmin && !match.winner"
                  v-model="scores[match.id][1]"
                  class="score-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  :aria-label="`Score de ${match.teams[1]}`"
                />
              </div>

              <p v-if="match.winner" class="winner-label">
                Vainqueur : {{ match.winner }}
              </p>

              <template v-else-if="isAdmin">
                <button
                  type="button"
                  class="btn-valider"
                  :disabled="enCours[match.id]"
                  @click="validerScore(match)"
                >
                  {{ enCours[match.id] ? "Enregistrement…" : "Valider" }}
                </button>
                <p v-if="erreursMatch[match.id]" class="match-error" role="alert">
                  {{ erreursMatch[match.id] }}
                </p>
              </template>
            </article>
          </div>
        </div>
      </div>
      <p v-else class="info">
        Les matchs seront générés quand toutes les équipes seront inscrites.
      </p>
    </template>
    <RouterLink class="text-link" :to="{ name: 'home', hash: '#tournois' }">
      Retour aux tournois
    </RouterLink>
  </section>
</template>
<style scoped>
.league-form {
  width: min(100% - 2rem, 1000px);
}

.tours {
  display: grid;
  gap: 1.5rem;
}

.tour-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--muted);
}

.champion {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.14);
  border: 1px solid rgba(34, 197, 94, 0.45);
  color: #86efac;
  font-weight: 700;
}

.matchs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.match {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #1e293b;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.72);
  text-align: center;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.equipe {
  flex: 1;
  padding: 0.5rem;
  border-radius: 8px;
  background: #1e293b;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.equipe--winner {
  border: 1px solid rgba(34, 197, 94, 0.6);
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
}

.score-input {
  width: 3.5rem;
  padding: 0.45rem 0.35rem;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
  color: inherit;
  text-align: center;
  font-weight: 600;
}

.vs {
  color: var(--muted);
  font-size: 0.75rem;
}

.winner-label {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #86efac;
  font-weight: 600;
}

.btn-valider {
  margin-top: 0.25rem;
  padding: 0.45rem 0.75rem;
  border: 0;
  border-radius: 8px;
  background: #0ea5e9;
  color: #082f49;
  font-weight: 700;
  cursor: pointer;
}

.btn-valider:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.match-error {
  margin: 0;
  font-size: 0.8rem;
  color: #f87171;
}
</style>
