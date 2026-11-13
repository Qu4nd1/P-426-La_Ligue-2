import { apiClient, findRecords } from "./api.js";

export const teamStatusLabels = {
  pending: "En attente",
  accepted: "Acceptée",
  rejected: "Refusée",
};

export const getTeams = (filters) => {
  return findRecords("/teams", filters);
};

export const updateTeamStatus = (teamId, status) => {
  return apiClient.patch(`/teams/${encodeURIComponent(teamId)}`, { status });
};

export function teamStatus(team) {
  return Object.hasOwn(teamStatusLabels, team.status) ? team.status : "pending";
}

export function teamCaptain(team) {
  return team.captain || team.capitain;
}

export function teamMembers(team) {
  if (Array.isArray(team.members)) return team.members;
  return [
    teamCaptain(team),
    ...(Array.isArray(team.players) ? team.players : []),
  ].filter(Boolean);
}

export function playerLimits(tournament) {
  const size = Number(tournament?.nbPlayers);
  if (Number.isInteger(size) && size >= 1 && size <= 5) {
    return { min: size, max: size };
  }
  return { min: 2, max: 5 };
}

export function hasValidPlayerCount(team, tournament) {
  const { min, max } = playerLimits(tournament);
  const count = teamMembers(team).length;
  return count >= min && count <= max;
}

export function countAcceptedTeams(teams) {
  return teams.filter((team) => team.status === "accepted").length;
}
