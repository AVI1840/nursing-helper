import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { writeFileSync, readFileSync } from "fs";

// Copy index.html → 404.html for SPA routing on GitHub Pages
const spa404Plugin = () => ({
  name: 'spa-404',
  closeBundle() {
    const index = readFileSync('dist/index.html', 'utf-8');
    writeFileSync('dist/404.html', index);
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/nursing-helper/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), spa404Plugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
