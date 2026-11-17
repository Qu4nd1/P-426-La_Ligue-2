<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  getRegistration,
  inscrireEquipe,
  retirerEquipe,
} from "../services/equipe.js";
import {
  playerLimits,
  teamStatus,
  teamStatusLabels,
} from "../services/teams.js";
import {
  creerMatchs,
  formatTournamentDate,
  getMatchs,
  getTournoi,
  isRegistrationOpen,
  isTournamentFull,
} from "../services/tournoi.js";

const tournamentId = String(useRoute().params.tournamentId);
const tournoi = ref(null);
const equipeInscrite = ref(null);
const acceptedCount = ref(0);
const matchs = ref([]);
const nomEquipe = ref("");
const joueurs = ref([]);
const loading = ref(true);
const action = ref("");
const loadError = ref("");
const erreur = ref("");
const succes = ref("");
let prochainId = 0;

const limites = computed(() => playerLimits(tournoi.value));
const peutAjouter = computed(() => joueurs.value.length < limites.value.max);
const peutRetirer = computed(() => joueurs.value.length > limites.value.min);
const tournoiComplet = computed(
  () => tournoi.value && isTournamentFull(tournoi.value, acceptedCount.value),
);

function nouveauJoueur() {
  return { id: prochainId++, pseudo: "" };
}

function resetForm() {
  nomEquipe.value = "";
  joueurs.value = Array.from({ length: limites.value.min }, nouveauJoueur);
}

function ajouterJoueur() {
  if (peutAjouter.value) joueurs.value.push(nouveauJoueur());
}

function retirerJoueur(id) {
  if (peutRetirer.value)
    joueurs.value = joueurs.value.filter((joueur) => joueur.id !== id);
}

async function loadTournament() {
  loading.value = true;
  loadError.value = "";
  try {
    const { data } = await getTournoi(tournamentId);
    tournoi.value = data;
    const registration = await getRegistration(tournamentId);
    equipeInscrite.value = registration.team;
    acceptedCount.value = registration.acceptedCount;
    if (isTournamentFull(data, registration.acceptedCount))
      await creerMatchs(data);
    matchs.value = (await getMatchs(tournamentId)).data;
    resetForm();
  } catch (cause) {
    loadError.value =
      cause.response?.status === 404
        ? "Ce tournoi est introuvable."
        : "Impossible de charger ce tournoi et ses inscriptions.";
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (action.value || equipeInscrite.value) return;
  erreur.value = "";
  succes.value = "";

  const name = nomEquipe.value.trim();
  const members = joueurs.value.map((joueur) => joueur.pseudo.trim());
  if (!name || members.some((pseudo) => !pseudo)) {
    erreur.value = "Renseignez le nom de l’équipe et tous les pseudos.";
    return;
  }
  if (
    new Set(members.map((pseudo) => pseudo.toLowerCase())).size !==
    members.length
  ) {
    erreur.value = "Chaque joueur doit avoir un pseudo différent.";
    return;
  }

  action.value = "inscription";
  try {
    equipeInscrite.value = await inscrireEquipe(tournamentId, {
      name,
      captain: members[0],
      members,
    });
    succes.value = "Inscription enregistrée.";
  } catch (cause) {
    erreur.value = cause.isAxiosError
      ? "Impossible d’inscrire l’équipe. Réessayez dans un instant."
      : cause.message;
  } finally {
    action.value = "";
  }
}

async function handleRetrait() {
  if (action.value || !equipeInscrite.value) return;
  action.value = "retrait";
  erreur.value = "";
  succes.value = "";
  try {
    const registration = await retirerEquipe(
      tournamentId,
      equipeInscrite.value.id,
    );
    acceptedCount.value = registration.acceptedCount;
    equipeInscrite.value = registration.team;
    resetForm();
    succes.value = "Équipe retirée du tournoi.";
  } catch {
    erreur.value = "Impossible de retirer l’équipe. Réessayez dans un instant.";
  } finally {
    action.value = "";
  }
}

onMounted(loadTournament);
</script>

<template>
  <section class="league-form">
    <h1>Inscrire mon équipe</h1>
    <p v-if="loading" class="info" role="status">Chargement du tournoi…</p>
    <template v-else-if="loadError">
      <p class="error" role="alert">{{ loadError }}</p>
      <button class="secondary" type="button" @click="loadTournament">
        Réessayer
      </button>
    </template>
    <template v-else>
      <p class="info">
        <strong>{{ tournoi.name }}</strong> · {{ tournoi.game }}
        <br />
        Inscriptions jusqu’au {{ formatTournamentDate(tournoi.date) }} inclus.
        <br />
        Équipes acceptées · {{ acceptedCount }} / {{ tournoi.nbTeam }}
      </p>
      <template v-if="matchs.length">
        <h2>Matchs</h2>
        <ul>
          <li v-for="match in matchs" :key="match.id">
            {{ match.teams[0] }} vs {{ match.teams[1] }}
          </li>
        </ul>
      </template>
      <template v-if="equipeInscrite">
        <p>
          <strong>{{ equipeInscrite.name }}</strong> ·
          {{ teamStatusLabels[teamStatus(equipeInscrite)] }}
        </p>
        <button
          type="button"
          class="secondary"
          :disabled="!!action"
          @click="handleRetrait"
        >
          {{ action === "retrait" ? "Retrait…" : "Retirer mon équipe" }}
        </button>
      </template>
      <p v-else-if="!isRegistrationOpen(tournoi)" class="info">
        Les inscriptions sont closes.
      </p>
      <p v-else-if="tournoiComplet" class="info">Le tournoi est complet.</p>
      <form v-else @submit.prevent="handleSubmit">
        <label>
          Nom de l’équipe
          <input
            v-model.trim="nomEquipe"
            type="text"
            maxlength="80"
            required
            :disabled="!!action"
          />
        </label>
        <fieldset :disabled="!!action">
          <legend>
            {{
              limites.min === limites.max
                ? `${limites.min} ${limites.min === 1 ? "joueur" : "joueurs"} par équipe`
                : `${joueurs.length}/${limites.max} joueurs · minimum ${limites.min}`
            }}
          </legend>
          <div
            v-for="(joueur, index) in joueurs"
            :key="joueur.id"
            class="joueur"
          >
            <label>
              {{
                index === 0
                  ? "Pseudo du capitaine"
                  : `Pseudo du joueur ${index + 1}`
              }}
              <input
                v-model.trim="joueur.pseudo"
                type="text"
                maxlength="50"
                required
              />
            </label>
            <button
              v-if="index > 0 && peutRetirer"
              type="button"
              class="secondary"
              :aria-label="`Retirer le joueur ${index + 1}`"
              @click="retirerJoueur(joueur.id)"
            >
              ×
            </button>
          </div>
          <button
            v-if="peutAjouter"
            class="secondary"
            type="button"
            @click="ajouterJoueur"
          >
            Ajouter un joueur
          </button>
        </fieldset>
        <button type="submit" :disabled="!!action">
          {{ action === "inscription" ? "Inscription…" : "Inscrire l’équipe" }}
        </button>
      </form>
    </template>
    <p v-if="erreur" class="error" role="alert">{{ erreur }}</p>
    <p v-if="succes" class="success" role="status">{{ succes }}</p>
    <RouterLink class="text-link" :to="{ name: 'home', hash: '#tournois' }">
      Retour aux tournois
    </RouterLink>
  </section>
</template>

<style scoped>
.joueur {
  display: flex;
  align-items: end;
  gap: 0.5rem;
}

.joueur label {
  flex: 1;
  min-width: 0;
}
</style>
