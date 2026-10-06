import { reactive } from "vue";

export const connectedUser = reactive({
  username: "",
  role: "",
  connected: false,
});
