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
  <table>
    <tr>
      <th>Name</th>
      <th>Game</th>
      <th>Date</th>
      <th>Number of team</th>
    </tr>
    <tr v-for="tournoi in tournois">
      <th>{{ tournoi.name }}</th>
      <th>{{ tournoi.game }}</th>
      <th>{{ tournoi.date }}</th>
      <th>{{ tournoi.nbTeam }}</th>
    </tr>
  </table>
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
</style>
