<script setup>
import { useRoute, useRouter } from "vue-router";
import { connectedUser, endSession } from "../stores/userStore.js";

const route = useRoute();
const router = useRouter();

function logout() {
  endSession();
  if (route.meta.adminOnly) router.replace({ name: "home" });
}
</script>

<template>
  <header class="navbar">
    <RouterLink class="brand" :to="{ name: 'home' }">
      <div class="logo" aria-hidden="true">L</div>
      <div>
        <strong>La Ligue</strong>
        <span>Plateforme esport</span>
      </div>
    </RouterLink>

    <nav aria-label="Navigation principale">
      <RouterLink :to="{ name: 'home', hash: '#tournois' }"
        >Tournois</RouterLink
      >
      <RouterLink :to="{ name: 'home', hash: '#fonctionnement' }"
        >Fonctionnement</RouterLink
      >
      <RouterLink :to="{ name: 'home', hash: '#classement' }"
        >Classement</RouterLink
      >
      <template v-if="connectedUser.role === 'admin'">
        <RouterLink :to="{ name: 'tournament-creation' }"
          >Créer un tournoi</RouterLink
        >
        <RouterLink :to="{ name: 'teams' }">Inscriptions</RouterLink>
      </template>
      <RouterLink
        v-if="!connectedUser.connected"
        :to="{ name: 'login' }"
        class="login-button"
      >
        Connexion
      </RouterLink>
      <button
        v-else
        class="login-button"
        type="button"
        :aria-label="`Déconnexion (${connectedUser.username})`"
        @click="logout"
      >
        Déconnexion
      </button>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.logo {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  font-size: 22px;
  font-weight: 800;
}

.brand strong {
  display: block;
  font-size: 18px;
}

.brand span {
  color: var(--muted);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px clamp(12px, 2vw, 28px);
}

nav a {
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
}

nav a:hover {
  color: white;
}

nav .login-button {
  padding: 8px 14px;
  border: 1px solid #334155;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.04);
  color: white;
  font-size: 14px;
  cursor: pointer;
}

nav .login-button:hover {
  background: white;
  color: var(--fond);
}

@media (max-width: 600px) {
  .navbar {
    padding: 20px;
  }
}
</style>
