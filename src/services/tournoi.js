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

export function decouperTours(matchs, nbEquipes) {
  const tours = [];
  let index = 0;
  let tailleTour = Math.floor(nbEquipes / 2);

  while (index < matchs.length && tailleTour >= 1) {
    tours.push(matchs.slice(index, index + tailleTour));
    index += tailleTour;
    tailleTour = Math.floor(tailleTour / 2);
  }

  if (index < matchs.length) {
    tours.push(matchs.slice(index));
  }

  return tours;
}

export async function enregistrerScoreMatch(
  tournoi,
  match,
  score1,
  score2,
  nbEquipes,
) {
  const winner = score1 > score2 ? match.teams[0] : match.teams[1];

  await apiClient.patch(`/matches/${encodeURIComponent(match.id)}`, {
    winner,
  });

  const { data: matchs } = await getMatchs(tournoi.id);
  const tours = decouperTours(matchs, nbEquipes);
  const dernierTour = tours[tours.length - 1] ?? [];

  if (dernierTour.length >= 2 && dernierTour.every((m) => m.winner)) {
    const gagnants = dernierTour.map((m) => m.winner);
    for (let i = 0; i + 1 < gagnants.length; i += 2) {
      await apiClient.post("/matches", {
        tournamentId: tournoi.id,
        game: tournoi.game,
        teams: [gagnants[i], gagnants[i + 1]],
        winner: null,
      });
    }
    return (await getMatchs(tournoi.id)).data;
  }

  return matchs;
}
