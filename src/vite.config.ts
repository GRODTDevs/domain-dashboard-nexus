
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Explicitly bind to all interfaces
    port: 8080,
    strictPort: true, // Fail if port is not available
    hmr: {
      clientPort: 8080, // Force client to use this port for HMR
      host: '0.0.0.0', // Ensure HMR works on all interfaces
      protocol: 'ws', // Use WebSocket protocol for HMR
      timeout: 60000, // Longer timeout for slower connections
    },
    watch: {
      usePolling: true, // Use polling for file watching (more reliable in some environments)
    }
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
    esbuildOptions: {
      target: 'es2020', // Target modern browsers for dependencies
    },
  },
  // Server-side specific configuration - will be used by Node.js
  ssr: {
    noExternal: ['mongodb'],
  },
  // Enable more detailed logging
  logLevel: 'info',
}));
