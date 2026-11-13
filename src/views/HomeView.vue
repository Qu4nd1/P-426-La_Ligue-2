<script setup>
import { computed, onMounted, ref } from "vue";
import TournamentList from "../components/TournamentList.vue";
import {
  getPredictionData,
  publishMatchResult,
  rankPredictions,
  savePrediction,
} from "../services/predictions.js";
import { connectedUser } from "../stores/userStore.js";

const matches = ref([]);
const predictions = ref([]);
const browserId = ref("");
const matchId = ref("");
const nickname = ref("");
const winner = ref("");
const loading = ref(true);
const loadError = ref("");
const saving = ref(false);
const error = ref("");
const success = ref("");

const match = computed(() =>
  matches.value.find((entry) => entry.id === matchId.value),
);
const savedPrediction = computed(() =>
  predictions.value.find(
    (entry) =>
      entry.matchId === matchId.value && entry.browserId === browserId.value,
  ),
);
const ranking = computed(() =>
  rankPredictions(matches.value, predictions.value),
);

function selectMatch() {
  winner.value = "";
  error.value = "";
  success.value = "";
  if (savedPrediction.value) nickname.value = savedPrediction.value.nickname;
}

async function loadPredictions() {
  loading.value = true;
  loadError.value = "";
  try {
    const data = await getPredictionData();
    matches.value = data.matches;
    predictions.value = data.predictions;
    browserId.value = data.browserId;

    const firstMatch =
      matches.value.find((entry) => !entry.winner) ?? matches.value[0];
    if (!match.value) matchId.value = firstMatch?.id ?? "";
    selectMatch();
  } catch {
    loadError.value = "Impossible de charger les pronostics et le classement.";
  } finally {
    loading.value = false;
  }
}

async function submitPrediction(team) {
  if (saving.value) return;
  error.value = "";
  success.value = "";
  const name = nickname.value.trim();
  if (!name) {
    error.value = "Saisissez un pseudo pour enregistrer votre pronostic.";
    return;
  }

  saving.value = true;
  try {
    const saved = await savePrediction(matchId.value, team, name);
    predictions.value = predictions.value
      .filter((entry) => entry.id !== saved.id)
      .concat(saved);
    success.value = "Pronostic enregistré.";
  } catch (cause) {
    error.value = cause.isAxiosError
      ? "Impossible d’enregistrer le pronostic."
      : cause.message;
  } finally {
    saving.value = false;
  }
}

async function submitResult() {
  if (saving.value || !winner.value) return;
  error.value = "";
  success.value = "";
  saving.value = true;
  try {
    const updated = await publishMatchResult(matchId.value, winner.value);
    matches.value = matches.value.map((entry) =>
      entry.id === updated.id ? updated : entry,
    );
  } catch (cause) {
    error.value = cause.isAxiosError
      ? "Impossible de publier le résultat. Réessayez dans un instant."
      : cause.message;
    return;
  } finally {
    saving.value = false;
  }
  await loadPredictions();
  success.value = "Résultat publié.";
}

onMounted(loadPredictions);
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <h1>Entrez dans <span>La Ligue</span></h1>
      <p class="hero-description">
        Participez à des tournois esport, soutenez vos équipes favorites et
        gagnez des points grâce à vos pronostics.
      </p>
      <div class="hero-actions">
        <RouterLink
          class="primary-button"
          :to="{ name: 'home', hash: '#tournois' }"
        >
          Voir les tournois <span aria-hidden="true">→</span>
        </RouterLink>
        <RouterLink
          class="secondary-button"
          :to="{ name: 'home', hash: '#pronostic' }"
        >
          Faire un pronostic
        </RouterLink>
      </div>
    </div>

    <div id="pronostic" class="hero-visual">
      <div class="glow" aria-hidden="true"></div>
      <section class="match-card" aria-label="Pronostics">
        <p v-if="loading" class="message" role="status">
          Chargement des matchs…
        </p>
        <div v-else-if="loadError">
          <p class="message error" role="alert">{{ loadError }}</p>
          <button
            type="button"
            class="secondary-button"
            @click="loadPredictions"
          >
            Réessayer
          </button>
        </div>
        <p v-else-if="!match" class="message">Aucun match disponible.</p>
        <template v-else>
          <div class="match-header">
            <span
              ><span class="live" aria-hidden="true"></span> MATCH DE
              DÉMONSTRATION</span
            >
            <span class="game">{{ match.game }}</span>
          </div>
          <label v-if="matches.length > 1" class="match-field">
            <span id="match-label">Match</span>
            <select
              v-model="matchId"
              aria-labelledby="match-label"
              :disabled="saving"
              @change="selectMatch"
            >
              <option
                v-for="entry in matches"
                :key="entry.id"
                :value="entry.id"
              >
                {{ entry.teams.join(" – ")
                }}{{ entry.winner ? " · Terminé" : "" }}
              </option>
            </select>
          </label>
          <div class="teams">
            <div class="team">
              <div class="team-logo purple" aria-hidden="true">
                {{ match.teams[0][0] }}
              </div>
              <span>{{ match.teams[0] }}</span>
            </div>
            <div class="versus"><strong>VS</strong></div>
            <div class="team">
              <div class="team-logo cyan" aria-hidden="true">
                {{ match.teams[1][0] }}
              </div>
              <span>{{ match.teams[1] }}</span>
            </div>
          </div>

          <div class="prediction">
            <template v-if="match.winner">
              <p class="message">
                Équipe gagnante · <strong>{{ match.winner }}</strong>
              </p>
              <p v-if="savedPrediction" class="message">
                Votre pronostic · {{ savedPrediction.team }} ·
                {{
                  match.winner === savedPrediction.team ? "1 point" : "0 point"
                }}
              </p>
            </template>
            <template v-else>
              <label class="match-field">
                Votre pseudo
                <input
                  v-model.trim="nickname"
                  type="text"
                  maxlength="32"
                  :disabled="saving"
                />
              </label>
              <div
                class="prediction-buttons"
                aria-label="Choisir l’équipe gagnante"
                role="group"
              >
                <button
                  v-for="team in match.teams"
                  :key="team"
                  type="button"
                  :aria-pressed="savedPrediction?.team === team"
                  :disabled="saving"
                  @click="submitPrediction(team)"
                >
                  {{ team }}
                </button>
              </div>
              <p v-if="savedPrediction" class="message">
                Votre pronostic · {{ savedPrediction.team }}
              </p>
            </template>

            <form
              v-if="connectedUser.role === 'admin' && !match.winner"
              class="result-form"
              @submit.prevent="submitResult"
            >
              <label class="match-field">
                <span id="winner-label">Équipe gagnante</span>
                <select
                  v-model="winner"
                  aria-labelledby="winner-label"
                  :disabled="saving"
                  required
                >
                  <option value="" disabled>Choisir l’équipe gagnante</option>
                  <option v-for="team in match.teams" :key="team" :value="team">
                    {{ team }}
                  </option>
                </select>
              </label>
              <button
                type="submit"
                class="secondary-button"
                :disabled="saving || !winner"
              >
                Publier le résultat
              </button>
            </form>

            <p v-if="error" class="message error" role="alert">{{ error }}</p>
            <p v-if="success" class="message success" role="status">
              {{ success }}
            </p>
          </div>
        </template>
      </section>
      <RouterLink
        class="ranking-card"
        :to="{ name: 'home', hash: '#classement' }"
      >
        <div>
          <span class="rank" aria-hidden="true">#1</span>
          <div>
            <strong>Voir le classement</strong>
            <p>Points gagnés grâce aux pronostics</p>
          </div>
        </div>
        <span class="arrow" aria-hidden="true">↗︎</span>
      </RouterLink>
    </div>
  </section>

  <section id="tournois" class="features" aria-labelledby="tournaments-heading">
    <TournamentList />
  </section>

  <section id="fonctionnement" class="features" aria-labelledby="rules-heading">
    <h2 id="rules-heading">Fonctionnement</h2>
    <div class="feature-grid">
      <article class="feature-card">
        <h3>Inscrivez votre équipe</h3>
        <p>
          Choisissez un tournoi ouvert et renseignez les pseudos de vos joueurs.
          La Ligue valide votre inscription.
        </p>
      </article>
      <article class="feature-card">
        <h3>Faites un pronostic</h3>
        <p>
          Saisissez votre pseudo et choisissez l’équipe gagnante. Vous pouvez
          modifier votre choix jusqu’à la publication du résultat.
        </p>
      </article>
      <article class="feature-card">
        <h3>Gagnez des points</h3>
        <p>
          Chaque pronostic correct rapporte un point. Le classement est mis à
          jour à la publication du résultat.
        </p>
      </article>
    </div>
  </section>

  <section id="classement" class="features" aria-labelledby="ranking-heading">
    <h2 id="ranking-heading">Classement des pronostics</h2>
    <p v-if="loading" class="message" role="status">
      Chargement du classement…
    </p>
    <p v-else-if="loadError" class="message">Classement indisponible.</p>
    <p v-else-if="ranking.length === 0" class="message">
      Aucun pronostic enregistré.
    </p>
    <table v-else class="ranking-table">
      <thead>
        <tr>
          <th scope="col">Rang</th>
          <th scope="col">Pseudo</th>
          <th scope="col">Points</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in ranking" :key="player.id">
          <td>{{ player.rank }}</td>
          <th scope="row">{{ player.nickname }}</th>
          <td>{{ player.points }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
/* HERO */
.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 32px 100px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  align-items: center;
  gap: clamp(28px, 6vw, 80px);
}
.hero h1 {
  max-width: 650px;
  margin: 24px 0;
  font-size: clamp(42px, 6vw, 82px);
  line-height: 1.12;
  letter-spacing: -0.055em;
}
.hero h1 span {
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
  flex-wrap: wrap;
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
/* HERO VISUAL */
.hero-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.glow {
  position: absolute;
  width: 75%;
  aspect-ratio: 1;
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
  padding: clamp(14px, 4vw, 26px);
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
  color: var(--muted);
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
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
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
  width: clamp(46px, 12vw, 68px);
  aspect-ratio: 1;
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
  padding: 0 clamp(8px, 2vw, 20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.versus strong {
  color: var(--muted);
}
.prediction {
  padding-top: 20px;
  border-top: 1px solid #1e293b;
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
.prediction-buttons button:hover:not(:disabled),
.prediction-buttons button[aria-pressed="true"] {
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
  color: inherit;
  text-decoration: none;
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
  color: var(--muted);
  font-size: 11px;
}
.arrow {
  color: var(--muted);
  font-size: 20px;
}

.match-field {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 13px;
}

.match-header + .match-field {
  margin-top: 15px;
}

.match-field input,
.match-field select {
  min-width: 0;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--texte);
  background: var(--fond);
}

.result-form {
  display: grid;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #1e293b;
}

button:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.message {
  margin: 10px 0;
  color: var(--muted);
  font-size: 14px;
}

.message.error {
  color: #fda4af;
}

.message.success {
  color: #86efac;
}

.features {
  padding: clamp(40px, 7vw, 76px) max(20px, calc((100% - 1136px) / 2));
  border-top: 1px solid #1e293b;
  background: #090f1c;
}

.features h2 {
  margin: 0 0 24px;
  font-size: clamp(26px, 5vw, 36px);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 22px;
  border: 1px solid #1e293b;
  border-radius: 12px;
  background: #0d1422;
}

.feature-card h3 {
  margin: 0 0 10px;
  font-size: 17px;
}

.feature-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.55;
  font-size: 14px;
}

.ranking-table {
  width: 100%;
  max-width: 660px;
  border-collapse: collapse;
  background: #0d1422;
}

.ranking-table th,
.ranking-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #1e293b;
  text-align: left;
  overflow-wrap: anywhere;
}

.ranking-table thead th {
  color: var(--accent);
  font-size: 13px;
}

.ranking-table :is(th, td):last-child {
  text-align: right;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    padding-top: 42px;
  }

  .hero-visual {
    max-width: 600px;
  }
}

@media (max-width: 600px) {
  .hero {
    padding: 28px 20px 50px;
  }

  .hero h1 {
    margin-top: 0;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .teams {
    padding: 24px 0;
  }
}
</style>
