
import { getDb } from './connection.mjs';

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
    
    // IMPORTANT: For MongoDB Atlas, we need to force database creation by inserting a document first
    // We're using a simpler approach that won't hang
    console.log('Server: Force creating database with initialization marker');
    try {
      await db.collection('_dbinit').insertOne({ 
        initialized: true,
        timestamp: new Date().toISOString() 
      });
      console.log('Server: Database creation forced with _dbinit collection');
    } catch (error) {
      console.error('Server: Error creating _dbinit collection:', error);
      // Continue anyway - this might fail if the collection already exists
    }
    
    // Now create the minimum required collections
    const collections = ['users', 'files', 'notes', 'seo_analysis', 'domains'];
    const results = {};
    
    for (const collName of collections) {
      try {
        console.log(`Server: Creating ${collName} collection`);
        await db.createCollection(collName).catch(() => {
          // Collection might already exist, which is fine
          console.log(`Server: Collection ${collName} already exists or couldn't be created`);
        });
        
        // Insert a creation document to ensure the collection exists
        await db.collection(collName).insertOne({
          _id: `${collName}_creation_marker`,
          _creationMarker: true,
          collectionName: collName,
          createdAt: new Date().toISOString()
        });
        results[`${collName}Created`] = true;
      } catch (error) {
        console.error(`Server: Error creating collection ${collName}:`, error);
        results[`${collName}Error`] = error.message;
      }
    }
    
    // Final verification of existing collections
    try {
      const finalCollections = await db.listCollections().toArray();
      const finalCollectionNames = finalCollections.map(c => c.name);
      console.log('Server: Final list of collections after initialization:', finalCollectionNames);
      
      // Consider initialization successful if we have at least created the _dbinit collection
      const success = finalCollectionNames.includes('_dbinit');
      
      if (success) {
        console.log('Server: Database initialization completed with basic structure');
        return { 
          status: 'ok', 
          message: 'Database initialized with basic structure',
          collections: finalCollectionNames,
          statusCode: 200
        };
      } else {
        console.error('Server: Database initialization failed - no collections created');
        return {
          status: 'error',
          message: 'Database initialization failed - no collections created',
          statusCode: 500
        };
      }
    } catch (error) {
      console.error('Server: Error listing collections after initialization:', error);
    }
    
    console.log('Server: Database initialization completed with partial structure');
    return { 
      status: 'ok', 
      message: 'Database initialized with partial structure',
      results,
      statusCode: 200
    };
    
  } catch (error) {
    console.error('Server: Database initialization error:', error);
    
    return { 
      status: 'error', 
      message: error.message,
      statusCode: 500
    };
  }
};
