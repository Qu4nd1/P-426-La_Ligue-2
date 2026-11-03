import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Get all teams from the API
export const getTeams = () => {
  return apiClient.get("/teams");
};

// Update the status of a team
export const updateTeamStatus = (teamId, status) => {
  return apiClient.patch(`/teams/${teamId}`, { status });
};

// Check if a team has a valid number of players (between 2 and 5)
export const hasValidPlayerCount = (team) => {
  return (
    Array.isArray(team.members) &&
    team.members.length >= 2 &&
    team.members.length <= 5
  );
};
