<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { verifyUser } from "../services/userAuth.js";
import { startSession } from "../stores/userStore.js";

const route = useRoute();
const router = useRouter();
const user = reactive({ email: "", pwd: "" });
const loading = ref(false);
const error = ref("");

async function login() {
  if (loading.value) return;
  loading.value = true;
  error.value = "";

  try {
    const result = await verifyUser(user);
    if (!result) {
      error.value = "Adresse e-mail ou mot de passe incorrect.";
      return;
    }

    startSession(result);
    const redirect = route.query.redirect;
    const adminRoutes = ["teams", "tournament-creation"];
    const name =
      result.role === "admin" && adminRoutes.includes(redirect)
        ? redirect
        : "home";
    await router.replace({ name });
  } catch (cause) {
    error.value = cause.isAxiosError
      ? "Connexion indisponible. Réessayez dans un instant."
      : cause.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="league-form">
    <h1>Connexion</h1>
    <form @submit.prevent="login">
      <label>
        Adresse e-mail
        <input
          v-model.trim="user.email"
          type="email"
          autocomplete="username"
          required
        />
      </label>
      <label>
        Mot de passe
        <input
          v-model="user.pwd"
          type="password"
          autocomplete="current-password"
          required
        />
      </label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button type="submit" :disabled="loading">
        {{ loading ? "Connexion…" : "Se connecter" }}
      </button>
    </form>
    <RouterLink class="text-link" :to="{ name: 'home' }"
      >Retour à l’accueil</RouterLink
    >
  </section>
</template>
