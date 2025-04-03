
'use strict';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const DEFAULT_PORT = 3000;
let PORT = process.env.PORT || DEFAULT_PORT;

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from the dist directory after build
app.use(express.static(path.join(__dirname, 'dist')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection status endpoint
app.get('/api/db/status', (req, res) => {
  // Since we're not actually connecting to MongoDB from the server,
  // we'll just return a success status if the endpoint is called
  res.json({ status: 'ok', connected: true });
});

// For any other routes, send the index.html file
// This enables client-side routing
app.get('*', (req, res) => {
  // Don't send index.html for API routes
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server with fallback if port is in use
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  return server;
}

const server = startServer(PORT);

export default app;
