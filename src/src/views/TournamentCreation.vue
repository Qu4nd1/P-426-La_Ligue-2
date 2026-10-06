<script setup>
import { ref } from 'vue'

const nom = ref('')
const jeu = ref('')
const date = ref('')
const nbEquipes = ref(8)

function creer() {
  const tournoi = {
    nom: nom.value,
    jeu: jeu.value,
    date: date.value,
    nbEquipes: nbEquipes.value,
  }
  console.log('Tournoi créé :', tournoi)
}
</script>
<template>
  <h1>Création de tournoi</h1>
  <form class="creer-tournoi" @submit.prevent="creer">
    <h2>Créer un tournoi</h2>

    <label>
      Nom du tournoi
      <input v-model="nom" type="text" required />
    </label>
    <br />
    <label>
      Jeu
      <input v-model="jeu" type="text" required />
    </label>
    <br />
    <label>
      Date
      <input v-model="date" type="date" required />
    </label>
    <br />
    <label>
      Nombre d'équipes
      <input v-model.number="nbEquipes" type="number" min="2" required />
    </label>
    <br />
    <button type="submit">Créer le tournoi</button>
  </form>
</template>
<style scoped>
.creer-tournoi {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  background: #101a33;
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

.creer-tournoi input {
  width: 100%;
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

.creer-tournoi input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2);
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
</style>
