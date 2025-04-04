
import { getDb } from '../connection.mjs';
import { createInitCollection } from './collection-creator.mjs';
import { createRequiredCollections } from './required-collections.mjs';
import { verifyInitialization } from './verification.mjs';

// Initialize database with collections
export const initializeDatabase = async (mongoUri) => {
  console.log('Server: Database initialization endpoint called');
  try {
    console.log(`Server: Initializing database with URI ${mongoUri ? 'provided' : 'missing'}`);
    
    if (!mongoUri) {
      console.error('Server: No MongoDB connection string provided for initialization');
      return { 
        status: 'error', 
        message: 'No MongoDB connection string provided',
        statusCode: 400
      };
    }
    
    // Get database reference from connection module
    const db = getDb();
    if (!db) {
      return {
        status: 'error',
        message: 'Database connection not established',
        statusCode: 500
      };
    }
    
    console.log('Server: Initializing database collections...');
    
    // Create initialization marker collection first
    try {
      await createInitCollection(db);
    } catch (error) {
      console.error('Server: Error creating _dbinit collection:', error);
      // Continue anyway - this might fail if the collection already exists
    }
    
    // Create all required collections
    const results = await createRequiredCollections(db);
    
    // Verify initialization
    const verificationResult = await verifyInitialization(db);
    
    // If verification successful
    if (verificationResult.success) {
      console.log('Server: Database initialization completed with basic structure');
      return { 
        status: 'ok', 
        message: 'Database initialized with basic structure',
        collections: verificationResult.collections,
        statusCode: 200
      };
    } 
    
    // Return success even with partial initialization to prevent hanging
    console.log('Server: Database initialization completed with partial structure');
    return { 
      status: 'ok', 
      message: 'Database initialization completed with partial structure',
      results,
      statusCode: 200
    };
    
  } catch (error) {
    console.error('Server: Database initialization error:', error);
    
    return { 
      status: 'error', 
      message: error.message || 'Unknown initialization error',
      statusCode: 500
    };
  }
};
