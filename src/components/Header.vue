<script setup>
import { connectedUser } from "../stores/userStore";
</script>
<template>
  <header class="navbar">
			<div class="brand">
				<div class="logo">L</div>

				<div>
					<h1>La Ligue</h1>
					<span>Esport Platform</span>
				</div>
			</div>

			<nav>
				<a href="#tournois">Tournois</a>
				<RouterLink :to="{name: 'tournament-creation'}">Créer un tournoi</RouterLink>
				<a href="#fonctionnement">Fonctionnement</a>
				<a href="#classement">Classement</a>
				<RouterLink
					:to="{ name: 'login' }"
					class="login-button"
					v-if="!connectedUser.connected"
				>
					Connexion
				</RouterLink>
				<button class="login-button" v-else>
					{{ connectedUser.username }}
				</button>
			</nav>
		</header>
</template>
<style scoped>
/* NAVBAR */

.navbar {
	width: 100%;
	max-width: 1200px;
	margin: 0 auto;
	padding: 24px 32px;

	display: flex;
	align-items: center;
	justify-content: space-between;
}
.brand {
	display: flex;
	align-items: center;
	gap: 12px;
}

.logo {
	width: 44px;
	height: 44px;

	display: flex;
	align-items: center;
	justify-content: center;

	border-radius: 12px;

	background: linear-gradient(135deg, #22d3ee, #6366f1);

	font-size: 22px;
	font-weight: 800;
}

.logo.small {
	width: 32px;
	height: 32px;
	font-size: 16px;
	border-radius: 8px;
}

.brand h1 {
	margin: 0;
	font-size: 18px;
}

.brand span {
	color: #64748b;
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 1.5px;
}

nav {
	display: flex;
	align-items: center;
	gap: 32px;
}

nav a {
	color: #94a3b8;
	text-decoration: none;
	font-size: 14px;
	transition: 0.2s;
}

nav a:hover {
	color: white;
}

.login-button {
	padding: 10px 20px;

	border: 1px solid #334155;
	border-radius: 10px;

	background: rgba(255, 255, 255, 0.04);
	color: white;

	cursor: pointer;

	transition: 0.2s;
}

.login-button:hover {
	background: white;
	color: #080d18;
}
@media (max-width: 900px) {
  nav a {
      display: none;
    }
}
@media (max-width: 600px) {
	.navbar {
		padding: 20px;
	}

	.brand span {
		display: none;
	}
}
</style>
