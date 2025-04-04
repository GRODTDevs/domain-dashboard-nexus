
// Main initialization module that exports the public API
import { initializeDatabase } from './database-initializer.mjs';

// Function to wrap initialization with detailed error handling
export async function initializeDatabaseWithDiagnostics(mongoUri) {
  console.log('Server: Starting database initialization with detailed diagnostics');
  try {
    const result = await initializeDatabase(mongoUri);
    return {
      ...result,
      diagnostics: {
        timestamp: new Date().toISOString(),
        success: result.status === 'ok',
        environmentChecks: {
          nodeEnv: process.env.NODE_ENV || 'not set',
          mongoUriConfigured: !!process.env.MONGODB_URI
        }
      }
    };
  } catch (error) {
    console.error('Server: Database initialization failed with diagnostic error:', error);
    return {
      status: 'error',
      message: error.message || 'Unknown initialization error',
      statusCode: 500,
      diagnostics: {
        timestamp: new Date().toISOString(),
        errorType: error.name,
        errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        environmentChecks: {
          nodeEnv: process.env.NODE_ENV || 'not set',
          mongoUriConfigured: !!process.env.MONGODB_URI
        }
      }
    };
  }
}

// Re-export public functions
export { initializeDatabase };
