import { apiClient, findRecords } from "./api.js";
import { getBrowserId, withBrowserLock } from "./browserSession.js";

export async function getPredictionData() {
  const [matches, predictions, browserId] = await Promise.all([
    apiClient.get("/matches"),
    apiClient.get("/predictions"),
    getBrowserId(),
  ]);
  return { matches: matches.data, predictions: predictions.data, browserId };
}

export function savePrediction(matchId, team, nickname) {
  return withBrowserLock(`la-ligue:match:${matchId}`, async () => {
    const browserId = await getBrowserId();
    const [{ data: match }, { data: entries }] = await Promise.all([
      apiClient.get(`/matches/${encodeURIComponent(matchId)}`),
      findRecords("/predictions", { matchId, browserId }),
    ]);
    if (match.winner)
      throw new Error("Les pronostics sont clos pour ce match.");
    if (!match.teams.includes(team))
      throw new Error("Choisissez une équipe du match.");

    const payload = { matchId, browserId, team, nickname };
    const existing = entries[0];
    const response = existing
      ? await apiClient.patch(
          `/predictions/${encodeURIComponent(existing.id)}`,
          payload,
        )
      : await apiClient.post("/predictions", payload);
    return response.data;
  });
}

export function publishMatchResult(matchId, winner) {
  return withBrowserLock(`la-ligue:match:${matchId}`, async () => {
    const url = `/matches/${encodeURIComponent(matchId)}`;
    const { data: match } = await apiClient.get(url);
    if (match.winner === winner) return match;
    if (match.winner)
      throw new Error("Le résultat de ce match est déjà publié.");
    if (!match.teams.includes(winner))
      throw new Error("Choisissez une équipe du match.");

    const { data } = await apiClient.patch(url, { winner });
    return data;
  });
}

export function rankPredictions(matches, predictions) {
  const matchesById = new Map(matches.map((match) => [match.id, match]));
  const players = new Map();
  const uniqueVotes = new Set();

  for (const prediction of predictions) {
    const match = matchesById.get(prediction.matchId);
    if (!match?.teams?.includes(prediction.team)) continue;
    const vote = `${prediction.browserId}:${prediction.matchId}`;
    if (uniqueVotes.has(vote)) continue;
    uniqueVotes.add(vote);

    const player = players.get(prediction.browserId) ?? {
      id: prediction.browserId,
      nickname: prediction.nickname,
      points: 0,
    };
    if (match.winner === prediction.team) player.points++;
    players.set(player.id, player);
  }

  const ranking = [...players.values()].sort(
    (a, b) => b.points - a.points || a.nickname.localeCompare(b.nickname, "fr"),
  );
  let rank = 0;
  return ranking.map((player, index) => {
    if (index === 0 || player.points !== ranking[index - 1].points)
      rank = index + 1;
    return { ...player, rank };
  });
}
