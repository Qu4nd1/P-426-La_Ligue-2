<script setup>
import { computed, onMounted, ref } from "vue";
import {
  countAcceptedTeams,
  getTeams,
  playerLimits,
} from "../services/teams.js";
import {
  formatTournamentDate,
  getTournois,
  isRegistrationOpen,
  isTournamentFull,
} from "../services/tournoi.js";

const tournois = ref([]);
const teams = ref([]);
const loading = ref(true);
const error = ref("");

const rows = computed(() =>
  tournois.value.map((tournament) => {
    const count = countAcceptedTeams(
      teams.value.filter((team) => team.tournamentId === tournament.id),
    );
    const { min, max } = playerLimits(tournament);
    return {
      ...tournament,
      count,
      size: min === max ? min : `${min} à ${max}`,
      status: !isRegistrationOpen(tournament)
        ? "Inscriptions closes"
        : isTournamentFull(tournament, count)
          ? "Complet"
          : "Inscriptions ouvertes",
    };
  }),
);

async function loadTournois() {
  loading.value = true;
  error.value = "";

  try {
    const [events, entries] = await Promise.all([
      getTournois(),
      getTeams({ status: "accepted" }),
    ]);
    tournois.value = events.data.sort((a, b) =>
      String(b.date).localeCompare(String(a.date)),
    );
    teams.value = entries.data;
  } catch {
    error.value = "Impossible de charger les tournois.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadTournois);
</script>

<template>
  <h2 id="tournaments-heading">Tournois</h2>
  <p v-if="loading" class="message" role="status">Chargement des tournois…</p>
  <div v-else-if="error" class="message">
    <p role="alert">{{ error }}</p>
    <button type="button" class="action" @click="loadTournois">
      Réessayer
    </button>
  </div>
  <p v-else-if="rows.length === 0" class="message">
    Aucun tournoi pour le moment.
  </p>
  <div
    v-else
    class="table-wrapper"
    tabindex="0"
    role="region"
    aria-labelledby="tournaments-heading"
  >
    <table>
      <thead>
        <tr>
          <th scope="col">Tournoi</th>
          <th scope="col">Jeu</th>
          <th scope="col" class="wide-column">Date</th>
          <th scope="col" class="wide-column">Équipes</th>
          <th scope="col" class="wide-column">Joueurs par équipe</th>
          <th scope="col">Inscription</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tournoi in rows" :key="tournoi.id">
          <th scope="row">
            {{ tournoi.name }}
            <span class="status compact-date">{{
              formatTournamentDate(tournoi.date)
            }}</span>
          </th>
          <td class="game">{{ tournoi.game }}</td>
          <td class="wide-column">{{ formatTournamentDate(tournoi.date) }}</td>
          <td class="wide-column">
            {{ tournoi.count }} / {{ tournoi.nbTeam ?? "—" }}
          </td>
          <td class="wide-column">{{ tournoi.size }}</td>
          <td>
            <RouterLink
              class="action"
              :to="{
                name: 'team-signup',
                params: { tournamentId: tournoi.id },
              }"
              :aria-label="`Voir le tournoi ${tournoi.name}`"
            >
              Voir le tournoi
            </RouterLink>
            <span class="status">{{ tournoi.status }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
h2 {
  margin: 0 0 24px;
  font-size: clamp(26px, 5vw, 36px);
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #1e293b;
  border-radius: 15px;
  background: #0d1422;
}

table {
  width: 100%;
  min-width: 690px;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: rgba(34, 211, 238, 0.05);
}

th,
td {
  padding: 13px 16px;
  border-bottom: 1px solid #1e293b;
  text-align: left;
  overflow-wrap: anywhere;
}

thead th {
  color: var(--accent);
  font-size: 12px;
}

tbody th {
  max-width: 210px;
}

tbody td {
  color: #cbd5e1;
}

tbody tr:last-child > * {
  border-bottom: 0;
}

.game {
  color: #a5b4fc;
}

.action {
  display: inline-block;
  padding: 6px 9px;
  border: 1px solid #334155;
  border-radius: 7px;
  color: var(--accent);
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.action:hover {
  background: rgba(34, 211, 238, 0.08);
}

.status {
  display: block;
  margin-top: 5px;
  color: var(--muted);
  font-size: 12px;
}

.message {
  color: var(--muted);
}

.compact-date {
  display: none;
}

@media (max-width: 720px) {
  table {
    min-width: 0;
    table-layout: fixed;
  }

  th,
  td {
    padding: 9px 8px;
  }

  thead th:last-child {
    width: 38%;
  }

  .wide-column {
    display: none;
  }

  .compact-date {
    display: block;
  }

  .action {
    white-space: normal;
  }
}
</style>
