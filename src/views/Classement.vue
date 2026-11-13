<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import {
  createMatch,
  getMatches,
  getNextMatchPosition,
  getWinnerId,
  updateMatch,
} from "../services/matches.js";
import { getTeams } from "../services/teams.js";

const route = useRoute();
const teams = ref([]);
const matches = ref([]);
const scores = ref({});
const loading = ref(true);
const error = ref("");
const currentAction = ref("");
const isAdminView = computed(() => route.name === "classement");
let liveRefreshTimer = null;

const rounds = computed(() =>
  [...new Set(matches.value.map((match) => Number(match.round)))].sort(
    (first, second) => first - second,
  ),
);

function teamName(teamId) {
  return teams.value.find((team) => team.id === teamId)?.name || "À déterminer";
}

function matchLabel(match) {
  return Number(match.round) === 1 ? "Premier tour" : `Tour ${match.round}`;
}

async function loadRanking(silent = false) {
  if (!silent) {
    loading.value = true;
  }
  error.value = "";

  try {
    const [teamsResponse, matchesResponse] = await Promise.all([
      getTeams(),
      getMatches(),
    ]);
    teams.value = teamsResponse.data;
    matches.value = matchesResponse.data.sort(
      (first, second) =>
        Number(first.round) - Number(second.round) ||
        Number(first.position) - Number(second.position),
    );
    matches.value.forEach((match) => {
      scores.value[match.id] = {
        team1: match.score1 ?? "",
        team2: match.score2 ?? "",
      };
    });
  } catch (caughtError) {
    error.value =
      caughtError.response?.data?.message ||
      "Impossible de charger le classement.";
  } finally {
    if (!silent) {
      loading.value = false;
    }
  }
}

function startLiveRefresh() {
  if (liveRefreshTimer) {
    clearInterval(liveRefreshTimer);
  }

  liveRefreshTimer = setInterval(() => {
    loadRanking(true);
  }, 5000);
}

async function saveScore(match) {
  const score = scores.value[match.id] || {};
  const score1 = score.team1;
  const score2 = score.team2;
  const winnerId = getWinnerId(match, score1, score2);

  if (
    !Number.isInteger(score1) ||
    !Number.isInteger(score2) ||
    score1 < 0 ||
    score2 < 0
  ) {
    error.value =
      "Les scores doivent être des nombres entiers positifs ou nuls.";
    return;
  }
  if (!winnerId) {
    error.value =
      "Une égalité n'est pas valide : le match doit avoir un vainqueur.";
    return;
  }

  currentAction.value = match.id;
  error.value = "";
  try {
    await updateMatch(match.id, {
      score1,
      score2,
      winnerId,
      status: "completed",
    });
    Object.assign(match, { score1, score2, winnerId, status: "completed" });
    await placeWinner(match, winnerId);
  } catch (caughtError) {
    error.value =
      caughtError.response?.data?.message ||
      "Impossible d'enregistrer le score du match.";
  } finally {
    currentAction.value = "";
  }
}

async function placeWinner(match, winnerId) {
  const nextPosition = getNextMatchPosition(match);
  let nextMatch = matches.value.find(
    (candidate) =>
      Number(candidate.round) === nextPosition.round &&
      Number(candidate.position) === nextPosition.position,
  );
  const update =
    Number(match.position) % 2 === 0
      ? { team1Id: winnerId }
      : { team2Id: winnerId };

  if (!nextMatch) {
    const response = await createMatch({
      ...nextPosition,
      team1Id: Number(match.position) % 2 === 0 ? winnerId : null,
      team2Id: Number(match.position) % 2 === 1 ? winnerId : null,
      status: "pending",
    });
    nextMatch = response.data;
    matches.value.push(nextMatch);
    scores.value[nextMatch.id] = { team1: "", team2: "" };
  } else {
    await updateMatch(nextMatch.id, update);
    Object.assign(nextMatch, update);
  }
}

onMounted(() => {
  loadRanking();
  startLiveRefresh();
});

onUnmounted(() => {
  if (liveRefreshTimer) {
    clearInterval(liveRefreshTimer);
  }
});
</script>

<template>
  <div class="ranking-page">
    <Header />
    <main class="ranking-content">
      <section class="heading">
        <div>
          <span class="eyebrow">
            {{ isAdminView ? "Gestion du tournoi" : "Bracket en direct" }}
          </span>
          <h2>{{ isAdminView ? "Classement et scores" : "Bracket du tournoi" }}</h2>
          <p>
            {{
              isAdminView
                ? "Saisissez le résultat d'un match pour faire avancer son vainqueur."
                : "Suivez en temps réel les résultats et l'évolution du tournoi."
            }}
          </p>
        </div>
      </section>

      <p v-if="error" class="message error">{{ error }}</p>
      <p v-if="loading" class="message">Chargement du classement...</p>
      <p v-else-if="matches.length === 0" class="message">
        Aucun match n'est disponible pour le moment.
      </p>

      <section v-else class="rounds" aria-label="Classement et matchs">
        <div v-for="round in rounds" :key="round" class="round">
          <h3>{{ round === 1 ? "Premier tour" : `Tour ${round}` }}</h3>
          <article
            v-for="match in matches.filter(
              (item) => Number(item.round) === round,
            )"
            :key="match.id"
            class="match-card"
          >
            <div class="match-teams">
              <span>{{ teamName(match.team1Id) }}</span>
              <span>{{ teamName(match.team2Id) }}</span>
            </div>
            <span class="round-label">{{ matchLabel(match) }}</span>

            <div v-if="isAdminView" class="score-fields">
              <input
                v-model.number="scores[match.id].team1"
                type="number"
                min="0"
                step="1"
                :disabled="match.status === 'completed' || currentAction !== ''"
                :aria-label="`Score de ${teamName(match.team1Id)}`"
              />
              <span>-</span>
              <input
                v-model.number="scores[match.id].team2"
                type="number"
                min="0"
                step="1"
                :disabled="match.status === 'completed' || currentAction !== ''"
                :aria-label="`Score de ${teamName(match.team2Id)}`"
              />
              <button
                :disabled="
                  match.status === 'completed' ||
                  currentAction !== '' ||
                  !match.team1Id ||
                  !match.team2Id
                "
                @click="saveScore(match)"
              >
                {{ match.status === "completed" ? "Enregistré" : "Valider" }}
              </button>
            </div>
            <div v-else class="score-readonly">
              <span>{{ match.score1 ?? "–" }}</span>
              <span>-</span>
              <span>{{ match.score2 ?? "–" }}</span>
            </div>

            <span v-if="match.status === 'completed'" class="winner"
              >Vainqueur : {{ teamName(match.winnerId) }}</span
            >
          </article>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.ranking-page {
  min-height: 100vh;
  background: #080d18;
  color: #f8fafc;
  font-family: "Ubuntu", sans-serif;
}
.ranking-content {
  max-width: 1200px;
  min-height: calc(100vh - 180px);
  margin: 0 auto;
  padding: 70px 32px;
}
.heading {
  margin-bottom: 36px;
}
.eyebrow {
  color: #22d3ee;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
h2 {
  margin: 8px 0;
  font-size: 38px;
}
.heading p {
  color: #94a3b8;
}
.rounds {
  display: grid;
  gap: 34px;
}
.round h3 {
  margin-bottom: 14px;
  color: #cbd5e1;
}
.round {
  display: grid;
  gap: 12px;
}
.match-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  border: 1px solid #1e293b;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.72);
}
.match-teams {
  display: grid;
  gap: 8px;
  font-weight: 600;
}
.round-label {
  color: #64748b;
  font-size: 12px;
}
.score-fields {
  display: flex;
  align-items: center;
  gap: 8px;
}
.score-fields input {
  width: 52px;
  padding: 9px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
  color: #f8fafc;
  text-align: center;
}
.score-readonly {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
  font-weight: 700;
  color: #e2e8f0;
}
button {
  padding: 9px 13px;
  border: 0;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
  font-weight: 600;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.winner {
  grid-column: 1 / -1;
  color: #4ade80;
  font-size: 13px;
}
.message {
  padding: 18px;
  border: 1px solid #1e293b;
  border-radius: 12px;
  color: #cbd5e1;
}
.message.error {
  margin-bottom: 16px;
  border-color: rgba(251, 113, 133, 0.5);
  color: #fda4af;
}
@media (max-width: 800px) {
  .ranking-content {
    padding: 40px 20px;
  }
  .match-card {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .score-fields {
    flex-wrap: wrap;
  }
}
</style>
