
import path from 'path';
import { fileURLToPath } from 'url';
import { checkConnectionStatus, initializeDatabase } from './db.mjs';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

// Configure API routes
export function setupRoutes(app) {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    console.log('Server: Health check endpoint called');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // MongoDB connection status endpoint
  app.get('/api/db/status', async (req, res) => {
    // First check environment variable, then query parameter
    const mongoUri = process.env.MONGODB_URI || req.query.uri;
    console.log('Server: DB status check with URI available:', !!mongoUri);
    const result = await checkConnectionStatus(mongoUri);
    console.log('Server: DB status result:', result);
    res.status(result.statusCode).json(result);
  });

  // Database initialization endpoint
  app.post('/api/db/init', async (req, res) => {
    console.log('Server: Database initialization endpoint called with body:', 
                req.body ? JSON.stringify(req.body).substring(0, 50) + '...' : 'null');
    
    // First check environment variable, then request body
    const mongoUri = process.env.MONGODB_URI || req.body.uri;
    
    if (!mongoUri) {
      console.error('Server: No MongoDB URI available for initialization');
      return res.status(400).json({
        status: 'error',
        message: 'No MongoDB connection string provided'
      });
    }
    
    console.log('Server: Starting database initialization with URI available:', !!mongoUri);
    const result = await initializeDatabase(mongoUri);
    console.log('Server: Database initialization result:', result);
    
    if (result.status === 'ok') {
      // Set a global flag that database is initialized
      console.log('Server: Setting MONGODB_INSTALLED flag to true');
      process.env.MONGODB_INSTALLED = 'true';
    }
    
    res.status(result.statusCode).json(result);
  });

  // For any other routes, send the index.html file
  // This enables client-side routing
  app.get('*', (req, res) => {
    // Don't send index.html for API routes
    if (req.url.startsWith('/api/')) {
      console.log(`Server: API route not found: ${req.url}`);
      return res.status(404).json({ error: "API endpoint not found" });
    }
    console.log(`Server: Serving index.html for client-side route: ${req.url}`);
    res.sendFile(path.join(projectRoot, 'dist', 'index.html'));
  });
}
