<script setup>
import { computed, onMounted, ref } from "vue";
import { withBrowserLock } from "../services/browserSession.js";
import {
  countAcceptedTeams,
  getTeams,
  hasValidPlayerCount,
  teamCaptain,
  teamMembers,
  teamStatus,
  teamStatusLabels,
  updateTeamStatus,
} from "../services/teams.js";
import { getTournois, isTournamentFull } from "../services/tournoi.js";

const teams = ref([]);
const tournaments = ref([]);
const loading = ref(true);
const loadError = ref("");
const actionError = ref("");
const currentAction = ref("");

const pendingCount = computed(
  () => teams.value.filter((team) => teamStatus(team) === "pending").length,
);
const tournamentsById = computed(
  () =>
    new Map(tournaments.value.map((tournament) => [tournament.id, tournament])),
);

function tournamentIsFull(team) {
  const tournament = tournamentsById.value.get(team.tournamentId);
  if (!tournament) return false;
  const entries = teams.value.filter(
    (entry) => entry.tournamentId === team.tournamentId,
  );
  return isTournamentFull(tournament, countAcceptedTeams(entries));
}

async function loadTeams() {
  loading.value = true;
  loadError.value = "";

  try {
    const [entries, events] = await Promise.all([getTeams(), getTournois()]);
    teams.value = entries.data;
    tournaments.value = events.data;
  } catch {
    loadError.value = "Impossible de charger les inscriptions.";
  } finally {
    loading.value = false;
  }
}

async function changeStatus(team, status) {
  if (currentAction.value) return;
  currentAction.value = team.id;
  actionError.value = "";

  try {
    await withBrowserLock("la-ligue:moderation", async () => {
      const { data } = await getTeams();
      teams.value = data;
      const current = data.find((entry) => entry.id === team.id);
      if (!current) {
        actionError.value = "Cette équipe s’est retirée du tournoi.";
        return;
      }
      if (teamStatus(current) !== "pending") {
        actionError.value = "Cette inscription a déjà été traitée.";
        return;
      }
      if (status === "accepted") {
        if (
          !hasValidPlayerCount(
            current,
            tournamentsById.value.get(current.tournamentId),
          )
        ) {
          actionError.value =
            "Le nombre de joueurs ne correspond pas à ce tournoi.";
          return;
        }
        if (tournamentIsFull(current)) {
          actionError.value =
            "Ce tournoi a atteint son nombre maximal d’équipes.";
          return;
        }
      }

      const { data: updated } = await updateTeamStatus(current.id, status);
      teams.value = teams.value.map((entry) =>
        entry.id === updated.id ? updated : entry,
      );
    });
  } catch (cause) {
    if (cause.response?.status === 404) {
      teams.value = teams.value.filter((entry) => entry.id !== team.id);
      actionError.value = "Cette équipe s’est retirée du tournoi.";
    } else {
      actionError.value =
        "Impossible de mettre à jour le statut de l’inscription.";
    }
  } finally {
    currentAction.value = "";
  }
}

onMounted(loadTeams);
</script>

<template>
  <section class="teams-content">
    <div class="page-heading">
      <div>
        <h1>Valider les inscriptions</h1>
        <p>Examinez les équipes qui souhaitent participer aux tournois.</p>
      </div>
      <span v-if="!loading && !loadError" class="pending-count"
        >{{ pendingCount }} en attente</span
      >
    </div>

    <p v-if="actionError" class="message error" role="alert">
      {{ actionError }}
    </p>
    <p v-if="loading" class="message" role="status">
      Chargement des inscriptions…
    </p>
    <div v-else-if="loadError" class="message error">
      <p role="alert">{{ loadError }}</p>
      <button type="button" class="retry-button" @click="loadTeams">
        Réessayer
      </button>
    </div>
    <p v-else-if="teams.length === 0" class="message">
      Aucune inscription pour le moment.
    </p>

    <div v-else class="team-list" aria-label="Liste des inscriptions">
      <article v-for="team in teams" :key="team.id" class="team-card">
        <div class="team-details">
          <div class="team-avatar" aria-hidden="true">
            {{ team.name?.charAt(0).toUpperCase() || "?" }}
          </div>
          <div>
            <h2>{{ team.name }}</h2>
            <p>
              {{
                tournamentsById.get(team.tournamentId)?.name ||
                "Tournoi non renseigné"
              }}
            </p>
            <p>Capitaine · {{ teamCaptain(team) || "Non renseigné" }}</p>
          </div>
        </div>

        <ul class="members" aria-label="Joueurs">
          <li v-for="(member, index) in teamMembers(team)" :key="index">
            {{ member }}
          </li>
        </ul>

        <div class="team-actions">
          <span class="status" :class="teamStatus(team)">{{
            teamStatusLabels[teamStatus(team)]
          }}</span>
          <template v-if="teamStatus(team) === 'pending'">
            <button
              type="button"
              class="accept-button"
              :disabled="
                !!currentAction ||
                tournamentIsFull(team) ||
                !hasValidPlayerCount(
                  team,
                  tournamentsById.get(team.tournamentId),
                )
              "
              @click="changeStatus(team, 'accepted')"
            >
              Accepter
            </button>
            <button
              type="button"
              class="reject-button"
              :disabled="!!currentAction"
              @click="changeStatus(team, 'rejected')"
            >
              Refuser
            </button>
            <span v-if="tournamentIsFull(team)" class="team-note"
              >Tournoi complet</span
            >
            <span
              v-else-if="
                !hasValidPlayerCount(
                  team,
                  tournamentsById.get(team.tournamentId),
                )
              "
              class="team-note"
            >
              Nombre de joueurs invalide
            </span>
          </template>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.teams-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(28px, 6vw, 70px) 32px;
}

.page-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px 24px;
  margin-bottom: 30px;
}

h1 {
  margin: 0 0 8px;
  font-size: clamp(28px, 5vw, 38px);
}

.page-heading p,
.team-details p {
  margin: 0;
  color: var(--muted);
}

.pending-count {
  padding: 10px 16px;
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 999px;
  color: var(--accent);
  white-space: nowrap;
}

.team-list {
  display: grid;
  gap: 16px;
}

.team-card {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 235px);
  align-items: center;
  gap: 16px 24px;
  padding: 24px;
  border: 1px solid #1e293b;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.72);
  overflow-wrap: anywhere;
}

.team-details {
  display: flex;
  align-items: center;
  gap: 14px;
}

.team-avatar {
  flex: 0 0 42px;
  display: grid;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  font-size: 20px;
  font-weight: 700;
}

h2 {
  margin: 0 0 6px;
  font-size: 17px;
}

.team-details p {
  margin: 3px 0;
  font-size: 13px;
}

.members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.members li {
  max-width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 12px;
}

.team-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: end;
  gap: 8px;
}

.team-note {
  flex-basis: 100%;
  color: var(--muted);
  text-align: end;
  font-size: 12px;
}

.status {
  color: #facc15;
  font-size: 12px;
  font-weight: 700;
}

.status.accepted {
  color: #4ade80;
}

.status.rejected {
  color: #fb7185;
}

button {
  padding: 8px 11px;
  border: 0;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.accept-button {
  background: #047857;
}

.reject-button {
  background: #be123c;
}

.retry-button {
  background: #1e293b;
}

.message {
  padding: 18px;
  border: 1px solid #1e293b;
  border-radius: 12px;
  color: #cbd5e1;
}

.message p {
  margin: 0 0 10px;
}

.message.error {
  margin-bottom: 16px;
  border-color: rgba(251, 113, 133, 0.5);
  color: #fda4af;
}

@media (max-width: 800px) {
  .teams-content {
    padding-inline: 20px;
  }

  .page-heading {
    align-items: start;
    flex-direction: column;
  }

  .team-card {
    grid-template-columns: minmax(0, 1fr);
    padding: 16px;
  }

  .team-actions {
    justify-content: start;
  }

  .team-note {
    text-align: start;
  }
}
</style>
