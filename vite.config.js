import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const proxy = {
  "/api/": {
    target: "http://127.0.0.1:3000",
    rewrite: (path) => path.replace(/^\/api/, ""),
  },
};

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: "127.0.0.1",
    proxy,
  },
  preview: { host: "127.0.0.1", proxy },
});
