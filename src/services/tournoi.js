import { apiClient, findRecords } from "./api.js";

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
