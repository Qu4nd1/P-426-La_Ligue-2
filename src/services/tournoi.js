import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000", // adapt to your backend
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const creerTournoi = (tournoi) => {
  return apiClient.post("/tournois", tournoi)
}
