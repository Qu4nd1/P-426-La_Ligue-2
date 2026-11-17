import { apiClient, findRecords } from "./api.js";
import { getTeams } from "./teams.js";

const dateFormat = new Intl.DateTimeFormat("fr-CH", { dateStyle: "medium" });

export async function creerTournoi(tournoi, creationId) {
  const { data } = await findRecords("/tournois", { creationId });
  if (data.length) return data[0];
  const response = await apiClient.post("/tournois", {
    ...tournoi,
    creationId,
  });
  return response.data;
}
export const getTournois = () => {
  return apiClient.get("/tournois");
};
export const getTournoi = (id) => {
  return apiClient.get(`/tournois/${encodeURIComponent(id)}`);
};

export function isTournamentDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return false;
  const day = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(day.getTime()) && day.toISOString().startsWith(date);
}

export function isRegistrationOpen(tournament) {
  return (
    isTournamentDate(tournament.date) &&
    Date.now() <= new Date(`${tournament.date}T23:59:59.999`).getTime()
  );
}

export function formatTournamentDate(date) {
  return isTournamentDate(date)
    ? dateFormat.format(new Date(`${date}T00:00:00`))
    : "À confirmer";
}

export function isTournamentFull(tournament, acceptedCount) {
  const capacity = Number(tournament.nbTeam);
  return (
    Number.isInteger(capacity) && capacity > 0 && acceptedCount >= capacity
  );
}
export async function creerMatchs(tournoi) {
  const { data: existants } = await findRecords("/matches", {
    tournamentId: tournoi.id,
  });
  if (existants.length) return;

  const { data: teams } = await getTeams({
    tournamentId: tournoi.id,
    status: "accepted",
  });
  const noms = teams.map((team) => team.name).sort(() => Math.random() - 0.5);

  for (let i = 0; i + 1 < noms.length; i += 2) {
    await apiClient.post("/matches", {
      tournamentId: tournoi.id,
      game: tournoi.game,
      teams: [noms[i], noms[i + 1]],
      winner: null,
    });
  }
}
export const getMatchs = (tournamentId) => {
  return findRecords("/matches", { tournamentId });
};
