import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "/var/www/html",
    //outDir: "../server/dist",
    emptyOutDir: true,
  },
  plugins: [react()],
});
