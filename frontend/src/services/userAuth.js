import axios from "axios";

const apiUser = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const verifyUser = async (user) => {
  try {
    const response = await apiUser.get("/users", {
      params: {
        email: user.email,
      },
    });

    const existingUser = response.data[0];

    if (!existingUser) {
      return false;
    }

    const hashedPassword = await hashSHA256(user.pwd);

    if (existingUser.pwdHash !== hashedPassword) {
      return false;
    }

    return existingUser;
  } catch (error) {
    console.error("Erreur pendant la connexion :", error);
    return false;
  }
};

export async function hashSHA256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
