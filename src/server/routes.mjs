
import path from 'path';
import { fileURLToPath } from 'url';
import { checkConnectionStatus, initializeDatabase } from './db/index.mjs';

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
    
    // Try multiple times if needed - MongoDB Atlas can be slow to create databases
    let retries = 0;
    const maxRetries = 3;
    let result = null;
    
    while (retries < maxRetries) {
      try {
        result = await checkConnectionStatus(mongoUri);
        console.log(`Server: DB status check attempt ${retries + 1} result:`, result);
        
        if (result.status === 'ok') {
          break;
        }
      } catch (error) {
        console.error(`Server: DB status check error on attempt ${retries + 1}:`, error);
        result = {
          status: 'error',
          connected: false,
          message: error.message || 'Unknown connection error',
          statusCode: 500
        };
      }
      
      retries++;
      if (retries < maxRetries) {
        console.log(`Server: Retrying connection check, attempt ${retries + 1} of ${maxRetries}`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('Server: DB status result:', result);
    res.status(result.statusCode || 500).json(result);
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
    
    // Try multiple times if needed - MongoDB Atlas can be slow to create databases
    let retries = 0;
    const maxRetries = 5; // Reduced max retries but made them more robust
    let result = null;
    
    while (retries < maxRetries) {
      try {
        console.log(`Server: Database initialization attempt ${retries + 1} of ${maxRetries}`);
        result = await initializeDatabase(mongoUri);
        console.log(`Server: Database initialization attempt ${retries + 1} result status:`, result.status);
        
        if (result.status === 'ok') {
          break;
        }
      } catch (error) {
        console.error(`Server: Database initialization error on attempt ${retries + 1}:`, error);
        result = {
          status: 'error',
          message: error.message || 'Failed to initialize MongoDB',
          statusCode: 500
        };
      }
      
      retries++;
      if (retries < maxRetries) {
        console.log(`Server: Retrying database initialization, attempt ${retries + 1} of ${maxRetries}`);
        // Wait longer between retries for initialization (exponential backoff)
        const waitTime = 2000 * Math.pow(1.5, retries); // Increases with each retry
        console.log(`Server: Waiting ${waitTime}ms before next attempt`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    if (result && result.status === 'ok') {
      // Set a global flag that database is initialized
      console.log('Server: Setting MONGODB_INSTALLED flag to true');
      process.env.MONGODB_INSTALLED = 'true';
    } else {
      console.error('Server: Failed to initialize database after multiple attempts:', result);
    }
    
    console.log('Server: Final database initialization result:', result);
    res.status(result?.statusCode || 500).json(result || {
      status: 'error',
      message: 'Database initialization failed with unknown error',
      statusCode: 500
    });
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
