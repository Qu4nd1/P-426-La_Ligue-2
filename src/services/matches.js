import axios from "axios";

export const matchesApiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const getMatches = () => matchesApiClient.get("/matches");

export const updateMatch = (matchId, match) =>
  matchesApiClient.patch(`/matches/${matchId}`, match);

export const createMatch = (match) => matchesApiClient.post("/matches", match);

export const getNextMatchPosition = (match) => ({
  round: Number(match.round) + 1,
  position: Math.floor(Number(match.position) / 2),
});

export const getWinnerId = (match, score1, score2) => {
  if (!Number.isInteger(score1) || !Number.isInteger(score2)) {
    return null;
  }

  if (score1 < 0 || score2 < 0 || score1 === score2) {
    return null;
  }

  return score1 > score2 ? match.team1Id : match.team2Id;
};
