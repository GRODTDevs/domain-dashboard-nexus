
'use strict';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { PORT, getStaticPath } from './src/server/config.mjs';
import { setupRoutes } from './src/server/routes.mjs';

// Create Express app
const app = express();
console.log(`Server: Initializing with port ${PORT}`);

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
console.log('Server: Middleware configured');

// Serve static files from the dist directory after build
app.use(express.static(getStaticPath()));
console.log(`Server: Static files configured from ${getStaticPath()}`);

// Set up API routes
setupRoutes(app);

// Start server with fallback if port is in use
function startServer(port) {
  console.log(`Server: Attempting to start server on port ${port}`);
  const server = app.listen(port, () => {
    console.log(`Server: Running on port ${port}`);
    console.log(`Server: MongoDB URI is ${process.env.MONGODB_URI ? 'set' : 'not set'}`);
    if (process.env.MONGODB_URI) {
      console.log(`Server: MongoDB URI starts with: ${process.env.MONGODB_URI.substring(0, 12)}...`);
    }
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Server: Port ${port} is already in use, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server: Error:', err);
    }
  });

  return server;
}

console.log('Server: Starting server...');
const server = startServer(PORT);

export default app;
