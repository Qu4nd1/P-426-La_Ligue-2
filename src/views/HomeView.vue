<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const equipe = ref("Équipe 1");
const sprint = ref(1);
</script>

<template>
	<div class="home">
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
				<a href="#fonctionnement">Fonctionnement</a>
				<a href="#classement">Classement</a>
				<RouterLink :to="{ name: 'login' }" class="login-button">
					Connexion
				</RouterLink>
			</nav>
		</header>

		<main>
			<section class="hero">
				<div class="hero-content">
					<div class="badge">Sprint {{ sprint }} · {{ equipe }}</div>

					<h2>
						Entrez dans
						<span>La Ligue</span>
					</h2>

					<p class="hero-description">
						Participez à des tournois esport, soutenez vos équipes favorites et
						tentez de grimper au sommet du classement grâce à vos pronostics.
					</p>

					<div class="hero-actions">
						<button class="primary-button">
							Rejoindre La Ligue
							<span>→</span>
						</button>

						<a href="#tournois" class="secondary-button"> Voir les tournois </a>
					</div>

					<div class="stats">
						<div class="stat">
							<strong>3</strong>
							<span>Équipes</span>
						</div>

						<div class="separator"></div>

						<div class="stat">
							<strong>100%</strong>
							<span>Esport</span>
						</div>

						<div class="separator"></div>

						<div class="stat">
							<strong>0 CHF</strong>
							<span>Argent réel</span>
						</div>
					</div>
				</div>

				<div class="hero-visual">
					<div class="glow"></div>

					<div class="match-card">
						<div class="match-header">
							<div>
								<span class="live"></span>
								MATCH À VENIR
							</div>

							<span class="game">VALORANT</span>
						</div>

						<div class="teams">
							<div class="team">
								<div class="team-logo purple">N</div>

								<span>NOVA</span>
							</div>

							<div class="versus">
								<strong>VS</strong>
								<span>20:30</span>
							</div>

							<div class="team">
								<div class="team-logo cyan">V</div>

								<span>VORTEX</span>
							</div>
						</div>

						<div class="prediction">
							<span>Votre pronostic</span>

							<div class="prediction-buttons">
								<button>NOVA</button>
								<button>VORTEX</button>
							</div>
						</div>
					</div>

					<div class="ranking-card">
						<div>
							<span class="rank">#1</span>

							<div>
								<strong>Classement</strong>
								<p>Grimpez dans la ligue</p>
							</div>
						</div>

						<span class="arrow">↗</span>
					</div>
				</div>
			</section>

			<section id="tournois" class="features">
				<div class="section-title">
					<span>LA PLATEFORME</span>
					<h2>Tout pour vivre la compétition.</h2>
				</div>

				<div class="feature-grid">
					<article class="feature-card">
						<div class="feature-icon">01</div>
						<h3>Tournois esport</h3>
						<p>
							Retrouvez les rencontres, les équipes et les résultats des
							différents tournois organisés sur La Ligue.
						</p>
					</article>

					<article class="feature-card">
						<div class="feature-icon">02</div>
						<h3>Pronostics</h3>
						<p>
							Faites vos pronostics avant les matchs et remportez des points
							lorsque vos prédictions sont correctes.
						</p>
					</article>

					<article class="feature-card">
						<div class="feature-icon">03</div>
						<h3>Classement</h3>
						<p>
							Comparez vos performances avec les autres joueurs et tentez
							d'atteindre la première place.
						</p>
					</article>
				</div>
			</section>
		</main>

		<footer>
			<div class="footer-brand">
				<div class="logo small">L</div>
				<strong>La Ligue</strong>
			</div>

			<p>
				Projet scolaire — les pronostics sont un jeu à
				<strong>points</strong> : aucun argent réel.
			</p>

			<span>© 2026 La Ligue</span>
		</footer>
	</div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap");

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
	font-family: "Ubuntu";
}

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

/* HERO */

.hero {
	max-width: 1200px;
	min-height: 650px;

	margin: 0 auto;
	padding: 90px 32px 120px;

	display: grid;
	grid-template-columns: 1.1fr 0.9fr;
	align-items: center;
	gap: 80px;
}

.badge {
	display: inline-flex;
	padding: 7px 14px;
	border: 1px solid rgba(34, 211, 238, 0.2);
	border-radius: 50px;
	background: rgba(34, 211, 238, 0.07);
	color: #22d3ee;
	font-size: 12px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 1px;
}

.hero h2 {
	max-width: 650px;
	margin: 24px 0;
	font-size: clamp(55px, 7vw, 90px);
	line-height: 1.12;
	letter-spacing: -4px;
}

.hero h2 span {
	display: block;
	background: linear-gradient(90deg, #22d3ee, #818cf8);
	background-clip: text;
	-webkit-background-clip: text;
	color: transparent;
}

.hero-description {
	max-width: 550px;

	margin-bottom: 35px;

	color: #94a3b8;

	font-size: 17px;
	line-height: 1.7;
}

.hero-actions {
	display: flex;
	gap: 15px;
}

.primary-button,
.secondary-button {
	min-height: 48px;

	padding: 0 24px;

	display: inline-flex;
	align-items: center;
	justify-content: center;

	border-radius: 10px;

	font-size: 14px;
	font-weight: 600;

	cursor: pointer;

	text-decoration: none;

	transition: 0.25s;
}

.primary-button {
	gap: 25px;

	border: none;

	background: #22d3ee;

	color: #051018;
}

.primary-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 10px 30px rgba(34, 211, 238, 0.2);
}

.secondary-button {
	border: 1px solid #334155;

	color: #cbd5e1;

	background: rgba(255, 255, 255, 0.02);
}

.secondary-button:hover {
	border-color: #64748b;
	color: white;
}

/* STATS */

.stats {
	margin-top: 65px;

	display: flex;
	align-items: center;
	gap: 25px;
}

.stat {
	display: flex;
	flex-direction: column;
}

.stat strong {
	font-size: 20px;
}

.stat span {
	margin-top: 4px;

	color: #64748b;

	font-size: 12px;
}

.separator {
	width: 1px;
	height: 30px;

	background: #1e293b;
}

/* HERO VISUAL */

.hero-visual {
	position: relative;

	display: flex;
	flex-direction: column;

	gap: 16px;
}

.glow {
	position: absolute;

	width: 400px;
	height: 400px;

	top: 0;
	left: 30px;

	background: #22d3ee;

	border-radius: 50%;

	filter: blur(180px);

	opacity: 0.08;

	pointer-events: none;
}

.match-card {
	position: relative;

	padding: 26px;

	border: 1px solid #1e293b;
	border-radius: 18px;

	background: rgba(15, 23, 42, 0.8);

	backdrop-filter: blur(12px);

	box-shadow: 0 30px 70px rgba(0, 0, 0, 0.25);
}

.match-header {
	display: flex;
	justify-content: space-between;
	align-items: center;

	padding-bottom: 22px;

	border-bottom: 1px solid #1e293b;

	color: #64748b;

	font-size: 11px;
	font-weight: 700;

	letter-spacing: 1px;
}

.live {
	display: inline-block;

	width: 7px;
	height: 7px;

	margin-right: 8px;

	border-radius: 50%;

	background: #22d3ee;
}

.game {
	color: #818cf8;
}

.teams {
	padding: 38px 0;

	display: grid;
	grid-template-columns: 1fr auto 1fr;

	align-items: center;
}

.team {
	display: flex;
	flex-direction: column;
	align-items: center;

	gap: 12px;

	font-size: 13px;
	font-weight: 700;
}

.team-logo {
	width: 68px;
	height: 68px;

	display: flex;
	align-items: center;
	justify-content: center;

	border-radius: 16px;

	font-size: 28px;
	font-weight: 800;
}

.purple {
	background: rgba(99, 102, 241, 0.15);
	color: #818cf8;
}

.cyan {
	background: rgba(34, 211, 238, 0.15);
	color: #22d3ee;
}

.versus {
	padding: 0 20px;

	display: flex;
	flex-direction: column;
	align-items: center;

	gap: 5px;
}

.versus strong {
	color: #475569;
}

.versus span {
	color: #94a3b8;
	font-size: 12px;
}

.prediction {
	padding-top: 20px;

	border-top: 1px solid #1e293b;
}

.prediction > span {
	color: #64748b;

	font-size: 11px;
	font-weight: 600;
}

.prediction-buttons {
	margin-top: 12px;

	display: grid;
	grid-template-columns: 1fr 1fr;

	gap: 10px;
}

.prediction-buttons button {
	padding: 11px;

	border: 1px solid #263449;
	border-radius: 8px;

	background: #101827;

	color: #94a3b8;

	cursor: pointer;

	transition: 0.2s;
}

.prediction-buttons button:hover {
	border-color: #22d3ee;

	color: #22d3ee;
}

/* RANKING */

.ranking-card {
	padding: 18px 20px;

	display: flex;
	justify-content: space-between;
	align-items: center;

	border: 1px solid #1e293b;
	border-radius: 14px;

	background: rgba(15, 23, 42, 0.6);
}

.ranking-card > div {
	display: flex;
	align-items: center;

	gap: 16px;
}

.rank {
	width: 42px;
	height: 42px;

	display: flex;
	justify-content: center;
	align-items: center;

	border-radius: 10px;

	background: rgba(34, 211, 238, 0.1);

	color: #22d3ee;

	font-weight: 700;
}

.ranking-card strong {
	font-size: 13px;
}

.ranking-card p {
	margin: 4px 0 0;

	color: #64748b;

	font-size: 11px;
}

.arrow {
	color: #64748b;

	font-size: 20px;
}

/* FEATURES */

.features {
	padding: 100px max(32px, calc((100% - 1136px) / 2));

	border-top: 1px solid #111827;

	background: #090f1c;
}

.section-title span {
	color: #22d3ee;

	font-size: 11px;
	font-weight: 700;

	letter-spacing: 2px;
}

.section-title h2 {
	max-width: 500px;

	margin: 12px 0 45px;

	font-size: 36px;
}

.feature-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);

	gap: 18px;
}

.feature-card {
	padding: 30px;

	border: 1px solid #1e293b;
	border-radius: 15px;

	background: #0d1422;

	transition: 0.25s;
}

.feature-card:hover {
	transform: translateY(-5px);

	border-color: #334155;
}

.feature-icon {
	margin-bottom: 45px;

	color: #22d3ee;

	font-size: 12px;
	font-weight: 700;
}

.feature-card h3 {
	margin-bottom: 12px;

	font-size: 18px;
}

.feature-card p {
	margin: 0;

	color: #64748b;

	line-height: 1.7;

	font-size: 14px;
}

/* FOOTER */

footer {
	max-width: 1200px;

	margin: auto;
	padding: 35px 32px;

	display: flex;
	align-items: center;
	justify-content: space-between;

	color: #475569;

	font-size: 12px;
}

.footer-brand {
	display: flex;
	align-items: center;

	gap: 10px;

	color: #94a3b8;
}

footer p {
	margin: 0;
}

footer strong {
	color: #94a3b8;
}

/* RESPONSIVE */

@media (max-width: 900px) {
	nav a {
		display: none;
	}

	.hero {
		grid-template-columns: 1fr;

		padding-top: 60px;

		gap: 70px;
	}

	.hero h2 {
		font-size: 65px;
	}

	.hero-visual {
		max-width: 600px;
	}

	.feature-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 600px) {
	.navbar {
		padding: 20px;
	}

	.brand span {
		display: none;
	}

	.hero {
		padding: 50px 20px 80px;
	}

	.hero h2 {
		font-size: 50px;
		letter-spacing: -3px;
	}

	.hero-actions {
		flex-direction: column;
	}

	.stats {
		gap: 15px;
	}

	.features {
		padding: 70px 20px;
	}

	footer {
		padding: 30px 20px;

		flex-direction: column;

		gap: 15px;

		text-align: center;
	}
}
</style>
