import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// React plugin enables Fast Refresh and the automatic JSX runtime.
// Without this, Vite still serves the app via esbuild but you lose HMR for state.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
  },
});
