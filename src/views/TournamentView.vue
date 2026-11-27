<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { countAcceptedTeams, getTeams } from "../services/teams.js";
import {
  createNextRound,
  creerMatchs,
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

// Organisation des matchs par tour
const rounds = computed(() => {
  if (!tournoi.value) return [];

  const byRound = {};

  for (const match of matchs.value) {
    (byRound[match.round ?? 1] ??= []).push(match);
  }

  const nbTeam = Number(tournoi.value.nbTeam);
  const totalRounds = Math.ceil(Math.log2(nbTeam));

  if (!Number.isFinite(totalRounds) || totalRounds < 1) return [];

  const result = [];

  for (let round = 1; round <= totalRounds; round++) {
    const expected = Math.ceil(nbTeam / 2 ** round);
    const currentMatches = byRound[round] ?? [];

    result.push(
      Array.from({ length: expected }, (_, i) => {
        return (
          currentMatches[i] ?? {
            id: `round${round}-${i}`,
            teams: [null, null],
            winner: null,
          }
        );
      }),
    );
  }

  return result;
});

// Champion du tournoi
const champion = computed(() => rounds.value.at(-1)?.[0]?.winner ?? null);

// Initialisation des scores
function initScores(listeMatchs) {
  for (const match of listeMatchs) {
    if (!scores[match.id]) {
      scores[match.id] = ["", ""];
    }
  }
}

// Nom du tour
function roundName(index) {
  const totalRounds = Math.ceil(Math.log2(Number(tournoi.value?.nbTeam)));

  const names = ["Finale", "Demi-finales", "Quarts de finale"];

  return names[totalRounds - 1 - index] ?? `Tour ${index + 1}`;
}

// Vérifie le vainqueur
function isWinner(match, index) {
  return Boolean(match.winner) && match.winner === match.teams?.[index];
}

// Vérifie le statut du match
function matchStatus(match) {
  if (match.winner) return "Terminé";

  return match.teams?.[0] && match.teams?.[1] ? "À jouer" : "En attente";
}

// Enregistrement du score
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
    score2 < 0 ||
    !Number.isInteger(score1) ||
    !Number.isInteger(score2)
  ) {
    erreursMatch[match.id] = "Saisissez deux scores entiers valides.";
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

    const { data } = await getMatchs(tournamentId);

    matchs.value = data;
    initScores(matchs.value);
  } catch (error) {
    console.error(error);
    erreursMatch[match.id] = "Impossible d'enregistrer le score.";
  } finally {
    enCours[match.id] = false;
  }
}

// Chargement du tournoi
onMounted(async () => {
  try {
    tournoi.value = (await getTournoi(tournamentId)).data;

    const { data: teams } = await getTeams({
      tournamentId,
      status: "accepted",
    });

    nbEquipes.value = countAcceptedTeams(teams);

    if (isTournamentFull(tournoi.value, nbEquipes.value)) {
      await creerMatchs(tournoi.value);
    }

    await createNextRound(tournoi.value);

    const { data } = await getMatchs(tournamentId);

    matchs.value = data;
    initScores(matchs.value);
  } catch (error) {
    console.error(error);
    erreur.value = "Impossible de charger ce tournoi.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="league-form">
    <p v-if="loading" class="info" role="status">Chargement du tournoi…</p>

    <p v-else-if="erreur" class="error" role="alert">
      {{ erreur }}
    </p>

    <template v-else-if="tournoi">
      <h1>{{ tournoi.name }}</h1>

      <div class="chips">
        <span class="chip">{{ tournoi.game }}</span>

        <span class="chip">
          {{ formatTournamentDate(tournoi.date) }}
        </span>

        <span class="chip">
          {{ nbEquipes }} / {{ tournoi.nbTeam }} équipes
        </span>
      </div>

      <p v-if="champion" class="champion">
        🏆 Champion · <strong>{{ champion }}</strong>
      </p>

      <!-- BRACKET -->
      <div v-if="matchs.length" class="bracket">
        <div
          v-for="(round, roundIndex) in rounds"
          :key="roundIndex"
          class="round"
          :style="{
            '--match-count': round.length,
            '--round-index': roundIndex,
            '--total-rounds': rounds.length,
          }"
        >
          <h2>{{ roundName(roundIndex) }}</h2>

          <div class="round-matches">
            <div
              v-for="(match, matchIndex) in round"
              :key="match.id"
              class="slot"
              :style="{
                '--match-index': matchIndex,
                '--match-count': round.length,
              }"
            >
              <article class="bracket-match" :class="{ done: match.winner }">
                <header class="match-head">
                  <span>Match {{ matchIndex + 1 }}</span>

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
                    empty: !match.teams?.[n],
                  }"
                >
                  <span class="name">
                    {{ match.teams?.[n] ?? "À déterminer" }}
                  </span>

                  <span v-if="isWinner(match, n)" class="check"> ✓ </span>
                </div>
              </article>

              <!-- Sortie vers le prochain tour -->
              <div
                v-if="roundIndex < rounds.length - 1"
                class="connector"
                :class="{
                  'connector-first': matchIndex % 2 === 0,
                  'connector-second': matchIndex % 2 === 1,
                }"
              >
                <span
                  class="connector-horizontal"
                  :class="{
                    active: match.winner,
                  }"
                ></span>

                <span
                  class="connector-vertical"
                  :class="{
                    active:
                      rounds[roundIndex][
                        matchIndex % 2 === 0 ? matchIndex + 1 : matchIndex - 1
                      ]?.winner,
                  }"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="info">
        Les matchs seront générés quand toutes les équipes seront inscrites.
      </p>

      <!-- LISTE DES MATCHS -->
      <h2>Matchs</h2>

      <p v-if="champion" class="champion">
        Vainqueur du tournoi : {{ champion }}
      </p>

      <div v-if="matchs.length" class="tours">
        <div v-for="(round, index) in rounds" :key="index" class="tour">
          <h3 v-if="rounds.length > 1" class="tour-title">
            {{ roundName(index) }}
          </h3>

          <div class="matchs">
            <article v-for="match in round" :key="match.id" class="match">
              <div class="team-row">
                <span
                  class="equipe"
                  :class="{
                    'equipe--winner': isWinner(match, 0),
                  }"
                >
                  {{ match.teams?.[0] ?? "À déterminer" }}
                </span>

                <input
                  v-if="
                    isAdmin &&
                    !match.winner &&
                    match.teams?.[0] &&
                    match.teams?.[1]
                  "
                  v-model="scores[match.id][0]"
                  class="score-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  :aria-label="`Score de ${match.teams[0]}`"
                />
              </div>

              <span class="vs">VS</span>

              <div class="team-row">
                <span
                  class="equipe"
                  :class="{
                    'equipe--winner': isWinner(match, 1),
                  }"
                >
                  {{ match.teams?.[1] ?? "À déterminer" }}
                </span>

                <input
                  v-if="
                    isAdmin &&
                    !match.winner &&
                    match.teams?.[0] &&
                    match.teams?.[1]
                  "
                  v-model="scores[match.id][1]"
                  class="score-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  :aria-label="`Score de ${match.teams[1]}`"
                />
              </div>

              <p v-if="match.winner" class="winner-label">
                Vainqueur : {{ match.winner }}
              </p>

              <template
                v-else-if="isAdmin && match.teams?.[0] && match.teams?.[1]"
              >
                <button
                  type="button"
                  class="btn-valider"
                  :disabled="enCours[match.id]"
                  @click="validerScore(match)"
                >
                  {{ enCours[match.id] ? "Enregistrement…" : "Valider" }}
                </button>

                <p
                  v-if="erreursMatch[match.id]"
                  class="match-error"
                  role="alert"
                >
                  {{ erreursMatch[match.id] }}
                </p>
              </template>
            </article>
          </div>
        </div>
      </div>
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
  font-weight: 700;
}

/* BRACKET */

.bracket {
  --gap: 3rem;
  --line-color: var(--border);
  --winner-color: #22c55e;

  display: flex;
  align-items: stretch;
  gap: var(--gap);
  padding: 1rem 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
}

.round {
  display: flex;
  flex-direction: column;
  flex: 1 0 230px;
  min-width: 230px;
  scroll-snap-align: start;
}

.round h2 {
  margin: 0 0 1rem;
  color: var(--accent);
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-align: center;
  text-transform: uppercase;
}

.round-matches {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Positionnement proportionnel des matchs */

.slot {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  min-height: 110px;
  padding: 0.5rem 0;
}

/* CARTES */

.bracket-match {
  position: relative;
  z-index: 2;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  transition: border-color 0.15s;
}

.bracket-match:hover {
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

/* EQUIPES */

.team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border-left: 3px solid transparent;
  font-weight: 600;
}

.team + .team {
  border-top: 1px solid var(--border);
}

.team .name {
  overflow-wrap: anywhere;
}

.team.empty {
  color: var(--muted);
  font-style: italic;
  font-weight: 400;
}

.team.loser {
  opacity: 0.45;
}

.team.winner {
  border-left-color: var(--winner-color);
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.2), transparent);
}

.check {
  color: var(--winner-color);
  font-weight: 700;
}

/* CONNEXIONS */

.connector {
  position: absolute;
  top: 0;
  left: 100%;
  width: var(--gap);
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* Ligne horizontale */

.connector-horizontal {
  position: absolute;
  top: 50%;
  left: 0;
  width: 50%;
  height: 2px;
  background: var(--line-color);
  transform: translateY(-50%);
}

/* Ligne verticale commune */

.connector-vertical {
  position: absolute;
  left: 50%;
  width: 2px;
  background: var(--line-color);
}

/* Premier match : branche vers le bas */

.connector-first .connector-vertical {
  top: 50%;
  height: 50%;
}

/* Deuxième match : branche vers le haut */

.connector-second .connector-vertical {
  top: 0;
  height: 50%;
}

/* Parcours des vainqueurs */

.connector-horizontal.active,
.connector-vertical.active {
  background: var(--winner-color);
}

.connector-horizontal.active {
  height: 3px;
}

.connector-vertical.active {
  width: 3px;
}

/* LISTE DES MATCHS */

.tours {
  display: grid;
  gap: 1.5rem;
}

.tour-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--muted);
}

.matchs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.match {
  position: relative;
  width: 100%;
  z-index: 1;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.92);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.team-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
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
  display: block;
  padding: 0 0.5rem;
  color: var(--muted);
  font-style: italic;
  font-weight: 400;
}

.winner-label {
  margin: 0.25rem 0.75rem;
  font-size: 0.8rem;
  color: #86efac;
  font-weight: 600;
}

/* BOUTONS */

.btn-valider {
  margin: 0.5rem 0.75rem;
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
  margin: 0 0.75rem 0.5rem;
  font-size: 0.8rem;
  color: #f87171;
}
</style>
