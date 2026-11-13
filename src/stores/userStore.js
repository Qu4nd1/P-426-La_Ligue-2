import { reactive } from "vue";

const sessionKey = "la-ligue:session";
const guest = {
  username: "",
  role: "",
  connected: false,
};

function readSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(sessionKey));
    if (typeof saved?.username === "string" && typeof saved.role === "string") {
      return { username: saved.username, role: saved.role, connected: true };
    }
  } catch {
    // La session reste disponible en mémoire si le stockage est bloqué.
  }
  return { ...guest };
}

export const connectedUser = reactive(readSession());

export function startSession({ username, role }) {
  Object.assign(connectedUser, { username, role, connected: true });
  try {
    sessionStorage.setItem(sessionKey, JSON.stringify({ username, role }));
  } catch {
    // La session en mémoire est déjà active.
  }
}

export function endSession() {
  Object.assign(connectedUser, guest);
  try {
    sessionStorage.removeItem(sessionKey);
  } catch {
    // La session en mémoire est déjà fermée.
  }
}
