import { findRecords } from "./api.js";

export async function verifyUser({ email, pwd }) {
  if (!crypto.subtle) {
    throw new Error(
      "Ouvrez La Ligue via localhost ou HTTPS pour vous connecter.",
    );
  }

  const { data: users } = await findRecords("/users", {
    email: email.trim().toLowerCase(),
  });
  const user = users[0];
  if (!user) return null;

  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pwd),
  );
  const pwdHash = Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return user.pwdHash === pwdHash ? user : null;
}
