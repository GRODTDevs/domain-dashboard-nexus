
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
    cors: true,
    hmr: {
      clientPort: 8080 // Force client to use this port for HMR
    },
    watch: {
      usePolling: true, // Use polling for file watching (more reliable in some environments)
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 60000, // Increase timeout to 60 seconds
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from:', req.url, 'Status:', proxyRes.statusCode);
          });
        }
      }
    },
  },
  base: './', // Set base to relative path for subfolder deployment
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
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
  // Make sure to load .env.local file (and .env)
  envDir: '.', // Set the directory where env files should be loaded from
  // Define environment variables that should be exposed to the client
  envPrefix: ['VITE_'], // Only expose variables with VITE_ prefix
  // Define specific optimizations for browser compatibility
  optimizeDeps: {
    exclude: ['mongodb'], // Exclude mongodb from optimization
  },
  // Enable more detailed logging
  logLevel: 'info',
}));
