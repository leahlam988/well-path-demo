import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    https: {
      key: readFileSync("./secret/dev.server.key"),
      cert: readFileSync("./secret/dev.server.chain.crt"),
    },
  },
  base: "/well-path-demo/",
});
