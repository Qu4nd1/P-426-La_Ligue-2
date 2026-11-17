import { apiClient } from "./api.js";
import { getBrowserId, withBrowserLock } from "./browserSession.js";
import { countAcceptedTeams, getTeams, hasValidPlayerCount } from "./teams.js";
import { getTournoi, isRegistrationOpen, isTournamentFull } from "./tournoi.js";

export async function getRegistration(tournamentId) {
  const { data: teams } = await getTeams({ tournamentId });
  const registrationId = await getBrowserId();
  return {
    team: teams.find((team) => team.registrationId === registrationId) ?? null,
    acceptedCount: countAcceptedTeams(teams),
  };
}

export function inscrireEquipe(tournamentId, equipe) {
  return withBrowserLock(`la-ligue:inscription:${tournamentId}`, async () => {
    const [{ data: tournament }, { team, acceptedCount }] = await Promise.all([
      getTournoi(tournamentId),
      getRegistration(tournamentId),
    ]);
    if (team) return team;
    if (!isRegistrationOpen(tournament))
      throw new Error("Les inscriptions sont closes.");
    if (isTournamentFull(tournament, acceptedCount))
      throw new Error("Le tournoi est complet.");
    if (!hasValidPlayerCount(equipe, tournament)) {
      throw new Error("Le nombre de joueurs ne correspond pas à ce tournoi.");
    }

    const { data } = await apiClient.post("/teams", {
      ...equipe,
      tournamentId,
      registrationId: await getBrowserId(),
      status: "pending",
    });
    return data;
  });
}

export function retirerEquipe(tournamentId, teamId) {
  return withBrowserLock(`la-ligue:inscription:${tournamentId}`, async () => {
    const registration = await getRegistration(tournamentId);
    if (registration.team?.id !== teamId) return registration;

    try {
      await apiClient.delete(`/teams/${encodeURIComponent(teamId)}`);
    } catch (error) {
      if (error.response?.status !== 404) throw error;
    }
    return {
      team: null,
      acceptedCount:
        registration.acceptedCount -
        Number(registration.team.status === "accepted"),
    };
  });
}
