<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { countAcceptedTeams, getTeams } from "../services/teams.js";
import {
  createNextRound,
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

const rounds = computed(() => {
  const byRound = {};
  for (const match of matchs.value) {
    (byRound[match.round ?? 1] ??= []).push(match);
  }

  const nbTeam = Number(tournoi.value.nbTeam);
  const totalRounds = Math.ceil(Math.log2(nbTeam));
  const result = [];
  for (let round = 1; round <= totalRounds; round++) {
    result.push(
      byRound[round] ??
        Array.from({ length: Math.ceil(nbTeam / 2 ** round) }, (_, i) => ({
          id: `round${round}-${i}`,
          teams: [null, null],
          winner: null,
        })),
    );
  }
  return result;
});

const champion = computed(() => rounds.value.at(-1)?.[0]?.winner ?? null);

function roundName(index) {
  const totalRounds = Math.ceil(Math.log2(Number(tournoi.value.nbTeam)));
  const names = ["Finale", "Demi-finales", "Quarts de finale"];
  return names[totalRounds - 1 - index] ?? `Tour ${index + 1}`;
}

function isWinner(match, index) {
  return Boolean(match.winner) && match.winner === match.teams[index];
}

function matchStatus(match) {
  if (match.winner) return "Terminé";
  return match.teams[0] && match.teams[1] ? "À jouer" : "En attente";
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
    await createNextRound(tournoi.value);
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
      <div class="chips">
        <span class="chip">{{ tournoi.game }}</span>
        <span class="chip">{{ formatTournamentDate(tournoi.date) }}</span>
        <span class="chip">
          {{ nbEquipes }} / {{ tournoi.nbTeam }} équipes
        </span>
      </div>

      <p v-if="champion" class="champion">
        🏆 Champion · <strong>{{ champion }}</strong>
      </p>

      <div v-if="matchs.length" class="bracket">
        <div v-for="(round, index) in rounds" :key="index" class="round">
          <h2>{{ roundName(index) }}</h2>
          <div class="round-matches">
            <div v-for="(match, i) in round" :key="match.id" class="slot">
              <article class="match" :class="{ done: match.winner }">
                <header class="match-head">
                  <span>Match {{ i + 1 }}</span>
                  <span class="badge" :class="{ done: match.winner }">
                    {{ matchStatus(match) }}
                  </span>
                </header>
                <div
                  v-for="n in [0, 1]"
                  :key="n"
                  class="team"
                  :class="{
                    winner: isWinner(match, n),
                    loser: match.winner && !isWinner(match, n),
                    empty: !match.teams[n],
                  }"
                >
                  <span class="name">{{ match.teams[n] ?? "À déterminer" }}</span>
                  <span v-if="isWinner(match, n)" class="check">✓</span>
                </div>
              </article>
            </div>
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
      ← Retour aux tournois
    </RouterLink>
  </section>
</template>

<style scoped>
.league-form {
  width: min(100% - 2rem, 1100px);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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

.chip {
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.08);
  color: var(--muted);
  font-size: 0.85rem;
}

.champion {
  padding: 0.9rem 1.2rem;
  border: 1px solid var(--accent);
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.22), transparent);
  font-size: 1.1rem;
}

.bracket {
  --gap: 3rem;
  display: flex;
  gap: var(--gap);
  padding: 0.5rem 0.25rem 1rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
}

.round {
  display: flex;
  flex-direction: column;
  flex: 1 0 230px;
  scroll-snap-align: start;
}

.round h2 {
  margin: 0 0 0.75rem;
  color: var(--accent);
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-align: center;
  text-transform: uppercase;
}

.round-matches {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.slot {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  padding: 0.5rem 0;
}

.match {
  position: relative;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.92);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  transition: border-color 0.15s;
}

.match:hover {
  border-color: var(--accent);
}

.match-head {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0.75rem;
  border-radius: 11px 11px 0 0;
  background: rgba(148, 163, 184, 0.08);
  color: var(--muted);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge {
  color: #fbbf24;
}

.badge.done {
  color: #4ade80;
}

.team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border-left: 3px solid transparent;
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
}

.team:last-child {
  border-radius: 0 0 11px 11px;
}

.team + .team {
  border-top: 1px solid var(--border);
}

.team .name {
  overflow-wrap: anywhere;
}

.team.empty {
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
  font-style: italic;
  font-weight: 400;
}

.team.loser {
  opacity: 0.45;
}

.team.winner {
  border-left-color: var(--accent);
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.2), transparent);
}

.check {
  color: var(--accent);
  font-weight: 700;
}

/* Traits de liaison entre les tours */
.round:not(:last-child) .match::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 100%;
  width: calc(var(--gap) / 2);
  border-top: 2px solid var(--border);
}

.round:not(:first-child) .match::before {
  content: "";
  position: absolute;
  top: 50%;
  right: 100%;
  width: calc(var(--gap) / 2);
  border-top: 2px solid var(--border);
}

.round:not(:last-child) .slot::after {
  content: "";
  position: absolute;
  right: calc(var(--gap) / -2);
  border-right: 2px solid var(--border);
}

.round:not(:last-child) .slot:nth-child(odd)::after {
  top: 50%;
  bottom: 0;
}

.round:not(:last-child) .slot:nth-child(even)::after {
  top: 0;
  bottom: 50%;
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
