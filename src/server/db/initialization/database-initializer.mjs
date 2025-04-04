
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
    const collectionResults = await createRequiredCollections(db);
    console.log('Server: Collection creation results:', collectionResults);
    
    if (!collectionResults.success) {
      console.error('Server: Failed to initialize collections properly');
      return {
        status: 'partial',
        message: 'Database initialization completed with errors',
        statusCode: 207,
        errors: collectionResults.errors
      };
    }
    
    // Verify initialization
    const verificationResult = await verifyInitialization(db);
    
    // If verification successful
    if (verificationResult.success) {
      console.log('Server: Database initialization completed successfully');
      return { 
        status: 'ok', 
        message: 'Database initialized successfully with all required data',
        collections: verificationResult.collections,
        statusCode: 200
      };
    } 
    
    // Verification failed - try to fix
    console.log('Server: Verification failed, attempting to fix issues:', verificationResult);
    
    // If users are missing, try to create them again
    if (!verificationResult.usersExist && verificationResult.collections.includes('users')) {
      console.log('Server: Attempting to create users again...');
      try {
        const { initializeUsersCollection } = await import('../collections/users.mjs');
        await initializeUsersCollection(db);
        console.log('Server: Users created in recovery attempt');
      } catch (userError) {
        console.error('Server: Failed to create users in recovery attempt:', userError);
      }
    }
    
    // Return partial success to allow app to continue
    return { 
      status: 'ok',  // Return ok to prevent app from hanging
      message: 'Database initialization completed with warnings',
      details: verificationResult,
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
}
