import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 8000,
  headers: { Accept: "application/json" },
});

export function findRecords(path, filters = {}) {
  // JSON Server converts numeric strings in ordinary query parameters to numbers.
  const where = Object.fromEntries(
    Object.entries(filters).map(([field, value]) => [field, { eq: value }]),
  );
  return apiClient.get(path, { params: { _where: JSON.stringify(where) } });
}
