// Adapte l'import à ce que tu utilises déjà dans services/tournoi.js
import axios from "axios";

export async function inscrireEquipe(tournoiId, equipe) {
  const { data } = await axios.post(
    `/api/tournois/${tournoiId}/equipes`,
    equipe,
  );
  return data; // on suppose que le serveur renvoie l'équipe avec son id
}

export async function retirerEquipe(tournoiId, equipeId) {
  await axios.delete(`/api/tournois/${tournoiId}/equipes/${equipeId}`);
}
