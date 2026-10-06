<script setup></script>
<template>
  <header>
    <h1>La Ligue</h1>
    <p class="sous-titre">Plateforme de tournoi esport — travail d'équipe {{ equipe }}</p>
  </header>
</template>
<style scoped>
:root {
  --fond: #0b1326;
  --texte: #dae2fd;
  --accent: #22d3ee;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--fond);
  color: var(--texte);
  min-height: 100vh;
}

header,
section.etat,
main,
footer {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 1.25rem;
}

header {
  padding-top: 2rem;
}
h1 {
  margin: 0;
  font-size: 2.2rem;
  letter-spacing: 0.02em;
}
.sous-titre {
  color: #93a1c4;
  margin-top: 0.25rem;
}

section.etat {
  border: 1px solid #24304d;
  border-radius: 10px;
  background: #101a33;
}
</style>
