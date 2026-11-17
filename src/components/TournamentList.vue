<script setup>
import { onMounted, ref } from "vue";
import { getTournois } from "../services/tournoi";

const tournois = ref([]);
onMounted(async () => {
  try {
    const response = await getTournois();
    tournois.value = response.data;
  } catch (e) {
    console.log("Tournois not found, " + e);
  } finally {
    console.log("Request completed : Ratings loaded");
  }
});
</script>
<template>
  <h2>Tournois</h2>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Game</th>
          <th>Date</th>
          <th>Number of Teams</th>
          <th>Players per Team</th>
          <th>Bracket</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tournoi in tournois" :key="tournoi.id">
          <td>{{ tournoi.name }}</td>
          <td class="game">{{ tournoi.game }}</td>
          <td>{{ tournoi.date }}</td>
          <td>{{ tournoi.nbTeam }}</td>
          <td>{{ tournoi.nbPlayers }}</td>
          <td>
            <RouterLink
              class="bracket-link"
              :to="{
                name: 'bracket',
                query: { game: tournoi.game, tournoi: tournoi.id },
              }"
            >
              Voir le bracket
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
h2 {
  margin: 12px 0 24px;
  font-size: 36px;
  color: #f8fafc;
}

/* Wrapper: rounded corners + horizontal scroll on small screens */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid #1e293b;
  border-radius: 15px;
  background: #0d1422;
}

table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: rgba(34, 211, 238, 0.05);
}

th {
  padding: 16px 24px;
  text-align: left;
  color: #22d3ee;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border-bottom: 1px solid #1e293b;
}

td {
  padding: 18px 24px;
  color: #cbd5e1;
  border-bottom: 1px solid #111827;
}

tbody tr {
  transition: background 0.2s;
}

tbody tr:hover {
  background: rgba(34, 211, 238, 0.04);
}

tbody tr:last-child td {
  border-bottom: none;
}

.game {
  color: #818cf8;
  font-weight: 600;
}

.bracket-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 600;
  transition: 0.2s;
}

.bracket-link:hover {
  background: rgba(34, 211, 238, 0.08);
  border-color: #22d3ee;
  color: #f8fafc;
}
</style>
