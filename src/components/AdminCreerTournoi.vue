<script setup>

import { ref } from 'vue';

const nom = ref('');
const jeu = ref('');
const date = ref('');
const nbEquipes = ref(8);

function creer() {
    const tournoi = {
        nom: nom.value,
        jeu: jeu.value,
        date: date.value,
        nbEquipes: nbEquipes.value,
    };
    console.log('Tournoi créé :', tournoi);
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
    <br>
    <label>
      Jeu
      <input v-model="jeu" type="text" required />
    </label>
    <br>
    <label>
      Date
      <input v-model="date" type="date" required />
    </label>
    <br>
    <label>
      Nombre d'équipes
      <input v-model.number="nbEquipes" type="number" min="2" required />
    </label>
    <br>
    <button type="submit">Créer le tournoi</button>
  </form>
</template>
<style scoped></style>