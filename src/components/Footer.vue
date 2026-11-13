<template>
  <footer>
    <div class="footer-brand">
      <div class="logo" aria-hidden="true">L</div>
      <strong>La Ligue</strong>
    </div>

    <p>
      Projet scolaire — les pronostics sont un jeu à
      <strong>points</strong> : aucun argent réel.
    </p>

    <span>© 2026 La Ligue</span>
  </footer>
</template>
<style scoped>
footer {
  width: 100%;
  max-width: 1200px;

  margin: auto;
  padding: 35px 32px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  color: #94a3b8;

  font-size: 12px;
}

.footer-brand {
  display: flex;
  align-items: center;

  gap: 10px;

  color: #94a3b8;
}

.logo {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  color: #080d18;
  font-weight: 800;
}

footer p {
  margin: 0;
}

footer strong {
  color: #94a3b8;
}
@media (max-width: 600px) {
  footer {
    padding: 30px 20px;

    flex-direction: column;

    gap: 15px;

    text-align: center;
  }
}
</style>
