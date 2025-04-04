
import { MongoClient } from 'mongodb';

// MongoDB connection
let mongoClient = null;
let db = null;

// MongoDB connection status check
export const checkConnectionStatus = async (mongoUri) => {
  console.log('Server: MongoDB status endpoint called');
  try {
    console.log(`Server: Checking MongoDB connection with URI ${mongoUri ? 'provided' : 'missing'}`);
    console.log('Server: MongoDB URI first 10 chars:', mongoUri ? mongoUri.substring(0, 10) + '...' : 'undefined');
    
    if (!mongoUri) {
      console.error('Server: No MongoDB connection string provided');
      return { 
        status: 'error', 
        connected: false, 
        message: 'No MongoDB connection string provided',
        statusCode: 400
      };
    }
    
    // Log connection attempt (without exposing sensitive data)
    console.log('Server: Attempting to connect to MongoDB...');
    
    // Try to connect to MongoDB if not already connected
    if (!mongoClient) {
      console.log('Server: Creating new MongoDB client');
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
      
      // Use "fsh" as the database name
      let dbName = 'fsh';
      console.log(`Server: Using database name: ${dbName}`);
      
      db = mongoClient.db(dbName);
      
      // Explicitly check if database exists by inserting a ping document
      // MongoDB Atlas creates databases lazily on first insert
      try {
        console.log('Server: Testing database existence with ping document');
        await db.collection('_ping').insertOne({ 
          timestamp: new Date().toISOString(),
          message: 'Database existence check'
        });
        console.log('Server: Successfully created database with ping');
      } catch (dbTestError) {
        console.log('Server: Database ping test error:', dbTestError.message);
        // Non-fatal error, continue
      }
      
      console.log(`Server: MongoDB connected successfully to database: ${dbName}`);
    } else {
      console.log('Server: Using existing MongoDB client');
    }
    
    // Check if connection is alive with a ping
    console.log('Server: Pinging MongoDB to verify connection');
    await db.command({ ping: 1 });
    console.log('Server: MongoDB ping successful');
    
    return { 
      status: 'ok', 
      connected: true,
      statusCode: 200
    };
  } catch (error) {
    console.error('Server: MongoDB connection error:', error);
    
    // Close the client if connection failed
    if (mongoClient) {
      console.log('Server: Closing MongoDB client due to connection error');
      await mongoClient.close();
      mongoClient = null;
      db = null;
    }
    
    return { 
      status: 'error', 
      connected: false, 
      message: error.message,
      statusCode: 500
    };
  }
};

// Make the MongoDB client and db available for other modules
export const getMongoClient = () => mongoClient;
export const getDb = () => db;
