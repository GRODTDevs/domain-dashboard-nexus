
import path from 'path';
import { fileURLToPath } from 'url';
import { checkConnectionStatus } from './db/connection.mjs';
import { initializeDatabase } from './db/initialization/index.mjs';

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

  // MongoDB connection status endpoint with timeout protection
  app.get('/api/db/status', async (req, res) => {
    // First check environment variable, then query parameter
    const mongoUri = process.env.MONGODB_URI || req.query.uri;
    console.log('Server: DB status check with URI available:', !!mongoUri);
    
    // Set a timeout for the entire handler
    const timeoutMs = 5000; // 5 seconds timeout
    let isResponseSent = false;
    
    const timeout = setTimeout(() => {
      if (!isResponseSent) {
        console.error(`Server: DB status check timed out after ${timeoutMs}ms`);
        isResponseSent = true;
        res.status(500).json({
          status: 'error',
          connected: false,
          message: 'MongoDB connection timed out',
          statusCode: 500
        });
      }
    }, timeoutMs);
    
    try {
      const result = await checkConnectionStatus(mongoUri);
      
      // Clear the timeout since we got a response
      clearTimeout(timeout);
      
      // Only send response if it hasn't been sent by timeout handler
      if (!isResponseSent) {
        console.log(`Server: DB status check result:`, result);
        isResponseSent = true;
        res.status(result.statusCode || 500).json(result);
      }
    } catch (error) {
      console.error(`Server: DB status check error:`, error);
      
      // Clear the timeout since we got a response
      clearTimeout(timeout);
      
      // Only send response if it hasn't been sent by timeout handler
      if (!isResponseSent) {
        isResponseSent = true;
        res.status(500).json({
          status: 'error',
          connected: false,
          message: error.message || 'Unknown connection error',
          statusCode: 500
        });
      }
    }
  });

  // Database initialization endpoint with timeout protection
  app.post('/api/db/init', async (req, res) => {
    console.log('Server: Database initialization endpoint called');
    
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
    
    // Set a timeout for the entire handler
    const timeoutMs = 8000; // 8 seconds timeout
    let isResponseSent = false;
    
    const timeout = setTimeout(() => {
      if (!isResponseSent) {
        console.error(`Server: Database initialization timed out after ${timeoutMs}ms`);
        isResponseSent = true;
        
        // Set a flag to indicate partial success - this allows client to continue
        process.env.MONGODB_INITIALIZED_PARTIAL = 'true';
        
        res.status(202).json({
          status: 'partial',
          message: 'Database initialization started but timed out. The application may still work with limited functionality.',
          statusCode: 202
        });
      }
    }, timeoutMs);
    
    try {
      const result = await initializeDatabase(mongoUri);
      
      // Clear the timeout since we got a response
      clearTimeout(timeout);
      
      // Only send response if it hasn't been sent by timeout handler
      if (!isResponseSent) {
        console.log('Server: Final database initialization result:', result);
        
        if (result && result.status === 'ok') {
          // Set a global flag that database is initialized
          console.log('Server: Setting MONGODB_INSTALLED flag to true');
          process.env.MONGODB_INSTALLED = 'true';
        }
        
        isResponseSent = true;
        res.status(result?.statusCode || 500).json(result || {
          status: 'error',
          message: 'Database initialization failed with unknown error',
          statusCode: 500
        });
      }
    } catch (error) {
      console.error('Server: Database initialization error:', error);
      
      // Clear the timeout since we got a response
      clearTimeout(timeout);
      
      // Only send response if it hasn't been sent by timeout handler
      if (!isResponseSent) {
        isResponseSent = true;
        res.status(500).json({
          status: 'error',
          message: error.message || 'Database initialization failed with unknown error',
          statusCode: 500
        });
      }
    }
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
