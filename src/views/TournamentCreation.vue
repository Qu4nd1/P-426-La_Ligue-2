<script setup>
import { computed, ref, watch } from "vue";
import { createBrowserId } from "../services/browserSession.js";
import { creerTournoi, isTournamentDate } from "../services/tournoi.js";
import { game } from "../services/jeux.js";

const tournoiVide = () => ({
  name: "",
  game: "",
  date: "",
  nbTeam: 8,
  nbPlayers: null,
});

const tournoi = ref(tournoiVide());
const loading = ref(false);
const error = ref("");
const success = ref(false);
const optionsJoueurs = computed(() => game[tournoi.value.game] ?? []);
let attempt;

watch(
  () => tournoi.value.game,
  () => {
    const options = optionsJoueurs.value;
    tournoi.value.nbPlayers = options.length === 1 ? options[0] : null;
  },
);

async function handleSubmit() {
  if (loading.value) return;
  error.value = "";
  success.value = false;
  const details = { ...tournoi.value, name: tournoi.value.name.trim() };

  if (!details.name || !optionsJoueurs.value.includes(details.nbPlayers)) {
    error.value =
      "Saisissez un nom et choisissez un jeu et un nombre de joueurs.";
    return;
  }
  if (
    !Number.isSafeInteger(details.nbTeam) ||
    details.nbTeam < 2 ||
    !isTournamentDate(details.date)
  ) {
    error.value = "Choisissez au moins deux équipes et une date valide.";
    return;
  }

  loading.value = true;
  try {
    const form = JSON.stringify(details);
    if (attempt?.form !== form) attempt = { form, id: createBrowserId() };
    await creerTournoi(details, attempt.id);
    attempt = undefined;
    success.value = true;
    tournoi.value = tournoiVide();
  } catch {
    error.value = "Impossible de créer le tournoi. Réessayez dans un instant.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="league-form">
    <h1>Créer un tournoi</h1>
    <form @submit.prevent="handleSubmit">
      <fieldset :disabled="loading" class="tournament-fields">
        <label>
          Nom du tournoi
          <input
            v-model.trim="tournoi.name"
            type="text"
            maxlength="80"
            required
          />
        </label>
        <label>
          <span id="game-label">Jeu</span>
          <select v-model="tournoi.game" aria-labelledby="game-label" required>
            <option value="" disabled>Choisir un jeu</option>
            <option v-for="(_, nom) in game" :key="nom" :value="nom">
              {{ nom }}
            </option>
          </select>
        </label>
        <label>
          <span id="team-size-label">Joueurs par équipe</span>
          <select
            v-model.number="tournoi.nbPlayers"
            aria-labelledby="team-size-label"
            :disabled="!tournoi.game"
            required
          >
            <option :value="null" disabled>
              {{ tournoi.game ? "Choisir" : "Choisissez d’abord un jeu" }}
            </option>
            <option v-for="n in optionsJoueurs" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </label>
        <label>
          Date du tournoi
          <input v-model="tournoi.date" type="date" required />
        </label>
        <label>
          Nombre d’équipes
          <input
            v-model.number="tournoi.nbTeam"
            type="number"
            min="2"
            step="1"
            required
          />
        </label>
        <button type="submit" :disabled="loading">
          {{ loading ? "Création…" : "Créer le tournoi" }}
        </button>
      </fieldset>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <p v-if="success" class="success" role="status">Tournoi créé !</p>
    </form>
    <RouterLink class="text-link" :to="{ name: 'home', hash: '#tournois' }">
      Voir les tournois
    </RouterLink>
  </section>
</template>

<style scoped>
.tournament-fields {
  border: 0;
  padding: 0;
}
</style>
