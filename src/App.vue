<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <h1>You did it!</h1>

  <RouterLink :to="{ name: 'tournament-creation' }">Créer tournoi !</RouterLink>
</template>

<style scoped></style>
