
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  base: './', // Set base to relative path for subfolder deployment
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    target: 'es2020', // Target modern browsers
  },
  // Make sure to load .env.local file
  envDir: '.',
  // Configuration for Node.js compatibility
  optimizeDeps: {
    exclude: ['mongodb'], // Exclude mongodb from client-side bundling
  },
  // Server-side specific configuration - will be used by Node.js
  ssr: {
    noExternal: ['mongodb'],
  }
}));
