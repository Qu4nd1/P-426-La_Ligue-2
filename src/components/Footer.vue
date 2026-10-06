<script setup></script>
<template>
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
</template>
<style scoped>
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
@media (max-width: 600px) {
  footer {
		padding: 30px 20px;

		flex-direction: column;

		gap: 15px;

		text-align: center;
	}
}
</style>
