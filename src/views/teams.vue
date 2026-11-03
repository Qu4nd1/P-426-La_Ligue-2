<script setup>
import { computed, onMounted, ref } from "vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import {
  getTeams,
  hasValidPlayerCount,
  updateTeamStatus,
} from "../services/teams.js";

const teams = ref([]);
const loading = ref(true);
const error = ref("");
const currentAction = ref("");

// Filter teams with pending status
const pendingTeams = computed(() =>
  teams.value.filter((team) => (team.status || "pending") === "pending"),
);

// Get the player count label for a team
function playerCountLabel(team) {
  const count = Array.isArray(team.members) ? team.members.length : 0;
  return `${count} joueur${count > 1 ? "s" : ""}`;
}

//Load teams from the API
async function loadTeams() {
  loading.value = true;
  error.value = "";

  try {
    const response = await getTeams();
    teams.value = response.data;
  } catch (error) {
    error.value =
      error.response?.data?.message ||
      "Impossible de charger les inscriptions.";
  } finally {
    loading.value = false;
  }
}

// Change the status of a team
async function changeStatus(team, status) {
  if (status === "accepted" && !hasValidPlayerCount(team)) {
    error.value =
      "Une équipe doit comporter entre 2 et 5 joueurs pour être acceptée.";
    return;
  }

  // Set the current action to indicate which team is being processed
  currentAction.value = `${team.id}-${status}`;
  error.value = "";

  try {
    await updateTeamStatus(team.id, status);
    team.status = status;
  } catch (error) {
    error.value =
      error.response?.data?.message ||
      "Impossible de mettre à jour le statut de l'inscription.";
  } finally {
    currentAction.value = "";
  }
}

onMounted(loadTeams);
</script>

<template>
  <div class="teams-page">
    <Header />

    <main class="teams-content">
      <section class="page-heading">
        <div>
          <span class="eyebrow">Espace administrateur</span>
          <h2>Valider les inscriptions</h2>
          <p>Contrôlez les équipes qui souhaitent participer à la ligue.</p>
        </div>
        <span class="pending-count">{{ pendingTeams.length }} en attente</span>
      </section>

      <p v-if="error" class="message error">{{ error }}</p>
      <p v-if="loading" class="message">Chargement des inscriptions...</p>
      <p v-else-if="teams.length === 0" class="message">
        Aucune inscription pour le moment.
      </p>

      <section v-else class="team-list" aria-label="Liste des inscriptions">
        <article v-for="team in teams" :key="team.id" class="team-card">
          <div class="team-details">
            <div class="team-avatar">
              {{ team.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3>{{ team.name }}</h3>
              <p>Capitaine : {{ team.capitain || team.captain }}</p>
              <p>{{ playerCountLabel(team) }}</p>
            </div>
          </div>

          <ul class="members">
            <li v-for="member in team.members" :key="member">{{ member }}</li>
          </ul>

          <div class="team-actions">
            <span class="status" :class="team.status || 'pending'">
              {{
                team.status === "accepted"
                  ? "Acceptée"
                  : team.status === "rejected"
                    ? "Refusée"
                    : "En attente"
              }}
            </span>
            <template v-if="(team.status || 'pending') === 'pending'">
              <button
                class="accept-button"
                :disabled="!hasValidPlayerCount(team) || currentAction !== ''"
                :title="
                  hasValidPlayerCount(team)
                    ? 'Accepter cette équipe'
                    : 'Une équipe doit avoir entre 2 et 5 joueurs'
                "
                @click="changeStatus(team, 'accepted')"
              >
                Accepter
              </button>
              <button
                class="reject-button"
                :disabled="currentAction !== ''"
                @click="changeStatus(team, 'rejected')"
              >
                Refuser
              </button>
            </template>
          </div>
        </article>
      </section>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.teams-page {
  min-height: 100vh;
  background: #080d18;
  color: #f8fafc;
  font-family: "Ubuntu", sans-serif;
}

.teams-content {
  max-width: 1200px;
  min-height: calc(100vh - 180px);
  margin: 0 auto;
  padding: 70px 32px;
}

.page-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
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

.page-heading p,
.team-details p {
  color: #94a3b8;
}

.pending-count {
  padding: 10px 16px;
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 999px;
  color: #22d3ee;
  white-space: nowrap;
}

.team-list {
  display: grid;
  gap: 16px;
}

.team-card {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto;
  align-items: center;
  gap: 24px;
  padding: 24px;
  border: 1px solid #1e293b;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.72);
}

.team-details {
  display: flex;
  align-items: center;
  gap: 16px;
}

.team-avatar {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  font-size: 20px;
  font-weight: 700;
}

h3 {
  margin-bottom: 6px;
}

.team-details p {
  margin: 3px 0;
  font-size: 13px;
}

.members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.members li {
  padding: 6px 10px;
  border-radius: 6px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 12px;
}

.team-actions {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 8px;
}

.status {
  margin-right: 8px;
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
  padding: 9px 13px;
  border: 0;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.accept-button {
  background: #059669;
}

.reject-button {
  background: #be123c;
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
  .teams-content {
    padding: 40px 20px;
  }

  .page-heading,
  .team-card {
    align-items: start;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .team-actions {
    justify-content: start;
    flex-wrap: wrap;
  }
}
</style>
