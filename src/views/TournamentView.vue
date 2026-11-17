<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { countAcceptedTeams, getTeams } from "../services/teams.js";
import {
  creerMatchs,
  formatTournamentDate,
  getMatchs,
  getTournoi,
  isTournamentFull,
} from "../services/tournoi.js";

const tournamentId = String(useRoute().params.tournamentId);
const tournoi = ref(null);
const matchs = ref([]);
const nbEquipes = ref(0);
const loading = ref(true);
const erreur = ref("");

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
      <div v-if="matchs.length" class="matchs">
        <article v-for="match in matchs" :key="match.id" class="match">
          <span class="equipe">{{ match.teams[0] }}</span>
          <span class="vs">VS</span>
          <span class="equipe">{{ match.teams[1] }}</span>
        </article>
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

.equipe {
  padding: 0.5rem;
  border-radius: 8px;
  background: #1e293b;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.vs {
  color: var(--muted);
  font-size: 0.75rem;
}
</style>
