<script setup>
import { ref, computed } from "vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { inscrireEquipe, retirerEquipe } from "../services/equipe.js";
import { tournoiTest as tournoi } from "../data/tournoi.js";

const MIN_JOUEURS = 2;
const MAX_JOUEURS = 5;

// id stable pour le :key (l'index poserait problème à la suppression)
let prochainId = 0;
const nouveauJoueur = () => ({ id: prochainId++, pseudo: "" });

const nomEquipe = ref("");
const joueurs = ref([nouveauJoueur(), nouveauJoueur()]);

// Équipe déjà inscrite (null = formulaire affiché)
const equipeInscrite = ref(null);

const chargement = ref(false);
const erreur = ref("");
const succes = ref("");

// Critère 1 : avant la date de clôture
const inscriptionOuverte = computed(
  () => new Date() <= new Date(`${tournoi.dateCloture}T23:59:59`),
);

// Critère 2 : nombre de joueurs OK (et aucun pseudo vide)
const nombreJoueursOk = computed(
  () =>
    joueurs.value.length >= MIN_JOUEURS &&
    joueurs.value.length <= MAX_JOUEURS &&
    joueurs.value.every((j) => j.pseudo.trim() !== ""),
);

const peutAjouter = computed(() => joueurs.value.length < MAX_JOUEURS);
const peutRetirer = computed(() => joueurs.value.length > MIN_JOUEURS);

const peutEnvoyer = computed(
  () =>
    inscriptionOuverte.value &&
    nomEquipe.value.trim() !== "" &&
    nombreJoueursOk.value &&
    !chargement.value,
);

function ajouterJoueur() {
  if (!peutAjouter.value) return; // protège aussi la fonction, pas seulement le bouton
  joueurs.value.push(nouveauJoueur());
}

function retirerJoueur(id) {
  if (!peutRetirer.value) return;
  joueurs.value = joueurs.value.filter((j) => j.id !== id);
}

async function handleSubmit() {
  if (!peutEnvoyer.value) return;
  chargement.value = true;
  erreur.value = "";
  succes.value = "";

  try {
    const equipe = await inscrireEquipe(tournoi.id, {
      name: nomEquipe.value.trim(),
      players: joueurs.value.map((j) => j.pseudo.trim()),
    });
    equipeInscrite.value = equipe;
    succes.value = "Équipe inscrite !";
  } catch (e) {
    erreur.value =
      e.response?.data?.message || "Impossible d'inscrire l'équipe.";
  } finally {
    chargement.value = false;
  }
}

async function handleRetrait() {
  chargement.value = true;
  erreur.value = "";
  succes.value = "";

  try {
    await retirerEquipe(tournoi.id, equipeInscrite.value.id);
    equipeInscrite.value = null;
    nomEquipe.value = "";
    joueurs.value = [nouveauJoueur(), nouveauJoueur()];
    succes.value = "Équipe retirée du tournoi.";
  } catch (e) {
    erreur.value =
      e.response?.data?.message || "Impossible de retirer l'équipe.";
  } finally {
    chargement.value = false;
  }
}
</script>

<template>
  <div class="home">
    <Header />

    <section class="inscription-equipe">
      <h2>Inscrire mon équipe</h2>
      <p class="info">
        Tournoi : <strong>{{ tournoi.name }}</strong> — clôture le
        {{ tournoi.dateCloture }}
      </p>

      <!-- Équipe déjà inscrite : on propose le retrait -->
      <div v-if="equipeInscrite">
        <p>
          L'équipe <strong>{{ equipeInscrite.name }}</strong> est inscrite.
        </p>
        <button
          type="button"
          class="secondaire"
          :disabled="chargement"
          @click="handleRetrait"
        >
          {{ chargement ? "Retrait…" : "Retirer mon équipe" }}
        </button>
      </div>

      <!-- Inscriptions fermées -->
      <p v-else-if="!inscriptionOuverte" class="message erreur">
        Les inscriptions sont closes depuis le {{ tournoi.dateCloture }}.
      </p>

      <!-- Formulaire -->
      <form v-else @submit.prevent="handleSubmit">
        <label>
          Nom de l'équipe
          <input v-model="nomEquipe" type="text" required />
        </label>

        <fieldset>
          <legend>Joueurs ({{ joueurs.length }}/{{ MAX_JOUEURS }})</legend>

          <div v-for="(joueur, i) in joueurs" :key="joueur.id" class="joueur">
            <input
              v-model="joueur.pseudo"
              type="text"
              :placeholder="`Pseudo du joueur ${i + 1}`"
              required
            />
            <button
              type="button"
              class="secondaire"
              :disabled="!peutRetirer"
              @click="retirerJoueur(joueur.id)"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            class="secondaire"
            :disabled="!peutAjouter"
            @click="ajouterJoueur"
          >
            + Ajouter un joueur
          </button>
        </fieldset>

        <p v-if="!nombreJoueursOk" class="aide">
          Il faut entre {{ MIN_JOUEURS }} et {{ MAX_JOUEURS }} joueurs, pseudos
          renseignés.
        </p>

        <button type="submit" :disabled="!peutEnvoyer">
          {{ chargement ? "Inscription…" : "Inscrire l'équipe" }}
        </button>
      </form>

      <p v-if="erreur" class="message erreur">{{ erreur }}</p>
      <p v-if="succes" class="message succes">{{ succes }}</p>
    </section>

    <Footer />
  </div>
</template>
<style scoped>
.home {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 75% 30%,
      rgba(34, 211, 238, 0.08),
      transparent 30%
    ),
    radial-gradient(
      circle at 20% 10%,
      rgba(99, 102, 241, 0.1),
      transparent 30%
    ),
    #080d18;
  color: #f8fafc;
  font-family: "Ubuntu", system-ui, sans-serif;
}

.inscription-equipe {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #24304d;
  border-radius: 10px;
}

.inscription-equipe h2 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
  letter-spacing: 0.02em;
  color: var(--accent);
}

.inscription-equipe form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.inscription-equipe label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #93a1c4;
}

.inscription-equipe input {
  width: auto;
  padding: 0.7rem 0.85rem;
  font: inherit;
  font-size: 1rem;
  text-transform: none;
  letter-spacing: normal;
  color: var(--texte);
  background: var(--fond);
  border: 1px solid #24304d;
  border-radius: 6px;
  color-scheme: dark;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.inscription-equipe input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2);
}

/* Bloc des joueurs */
.inscription-equipe fieldset {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
  padding: 1rem;
  border: 1px solid #24304d;
  border-radius: 6px;
}

.inscription-equipe legend {
  padding: 0 0.4rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #93a1c4;
}

.inscription-equipe .joueur {
  display: flex;
  gap: 0.5rem;
}

.inscription-equipe .joueur input {
  flex: 1;
  min-width: 0;
}

/* Textes d'info et d'aide */
.inscription-equipe .info,
.inscription-equipe .aide {
  margin: 0;
  font-size: 0.85rem;
  color: #93a1c4;
}

/* Boutons */
.inscription-equipe button {
  margin-top: 0.5rem;
  padding: 0.8rem 1rem;
  font: inherit;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fond);
  background: var(--accent);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

.inscription-equipe button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(34, 211, 238, 0.35);
}

.inscription-equipe button:active {
  transform: translateY(0);
}

.inscription-equipe button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Boutons secondaires (ajouter / retirer) */
.inscription-equipe button.secondaire {
  margin-top: 0;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent);
}

.inscription-equipe button.secondaire:hover:not(:disabled) {
  background: rgba(34, 211, 238, 0.1);
}

/* Messages */
.inscription-equipe .message {
  margin: 0;
  font-size: 0.9rem;
}

.inscription-equipe .erreur {
  color: #f87171;
}

.inscription-equipe .succes {
  color: var(--accent);
}
</style>
