<script setup>
import { computed, ref, watch } from "vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { creerTournoi } from "../services/tournoi.js";
import { game } from "../services/jeux.js";

const tournoiVide = () => ({
  id: 0,
  name: "",
  game: "",
  date: "",
  nbTeam: 8,
  nbPlayers: null,
});

const tournoi = ref(tournoiVide());

const chargement = ref(false);
const erreur = ref("");
const succes = ref(false);

// Options de joueurs selon le jeu choisi
const optionsJoueurs = computed(() => game[tournoi.value.game] ?? []);

// Quand le jeu change : si un seul choix possible, on le sélectionne,
// sinon on remet à vide pour forcer un choix valide
watch(
  () => tournoi.value.game,
  () => {
    const options = optionsJoueurs.value;
    tournoi.value.nbPlayers = options.length === 1 ? options[0] : null;
  },
);

async function handleSubmit() {
  chargement.value = true;
  erreur.value = "";
  succes.value = false;

  try {
    await creerTournoi(tournoi.value);
    succes.value = true;
    tournoi.value = tournoiVide();
  } catch (e) {
    erreur.value =
      e.response?.data?.message || "Impossible de créer le tournoi.";
  } finally {
    chargement.value = false;
  }
}
</script>

<template>
  <div class="home">
    <Header />

    <form class="creer-tournoi" @submit.prevent="handleSubmit">
      <h2>Créer un tournoi</h2>

      <label>
        Nom du tournoi
        <input v-model="tournoi.name" type="text" required />
      </label>

      <label>
        Jeu
        <select v-model="tournoi.game" required>
          <option value="" disabled>Choisir un jeu</option>
          <option v-for="(_, nom) in game" :key="nom" :value="nom">
            {{ nom }}
          </option>
        </select>
      </label>

      <label>
        Joueurs par équipe
        <select
          v-model.number="tournoi.nbPlayers"
          :disabled="!tournoi.game"
          required
        >
          <option :value="null" disabled>
            {{ tournoi.game ? "Choisir" : "Choisis d'abord un jeu" }}
          </option>
          <option v-for="n in optionsJoueurs" :key="n" :value="n">
            {{ n }}
          </option>
        </select>
      </label>

      <label>
        Date
        <input v-model="tournoi.date" type="date" required />
      </label>

      <label>
        Nombre d'équipes
        <input v-model.number="tournoi.nbTeam" type="number" min="2" required />
      </label>

      <button type="submit" :disabled="chargement">
        {{ chargement ? "Création…" : "Créer le tournoi" }}
      </button>

      <p v-if="erreur" class="message erreur">{{ erreur }}</p>
      <p v-if="succes" class="message succes">Tournoi créé !</p>
    </form>

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

.creer-tournoi {
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

.creer-tournoi h2 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
  letter-spacing: 0.02em;
  color: var(--accent);
}

.creer-tournoi label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #93a1c4;
}

.creer-tournoi input,
.creer-tournoi select {
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

.creer-tournoi input:focus,
.creer-tournoi select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2);
}

.creer-tournoi select {
  cursor: pointer;
}

.creer-tournoi select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.creer-tournoi button {
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

.creer-tournoi button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(34, 211, 238, 0.35);
}

.creer-tournoi button:active {
  transform: translateY(0);
}

.creer-tournoi button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.creer-tournoi .message {
  margin: 0;
  font-size: 0.9rem;
}

.creer-tournoi .erreur {
  color: #f87171;
}

.creer-tournoi .succes {
  color: var(--accent);
}
</style>
