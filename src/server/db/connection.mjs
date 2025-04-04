
import { MongoClient } from 'mongodb';

// MongoDB connection
let mongoClient = null;
let db = null;

// MongoDB connection status check
export const checkConnectionStatus = async (mongoUri) => {
  console.log('Server: MongoDB status endpoint called');
  try {
    console.log(`Server: Checking MongoDB connection with URI ${mongoUri ? 'provided' : 'missing'}`);
    
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
    
    // Create a new client for testing connection with shorter timeouts
    const testClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 2000, // 2 second timeout for server selection (reduced from 5s)
      connectTimeoutMS: 5000,        // 5 second timeout for connection (reduced from 10s)
      socketTimeoutMS: 10000,         // 10 second timeout for socket operations (reduced from 30s)
    });
    
    try {
      // Try to connect with timeout protection
      const connectPromise = testClient.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('MongoDB connection timed out')), 7000);
      });
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      // Use "fsh" as the database name
      let dbName = 'fsh';
      console.log(`Server: Using database name: ${dbName}`);
      
      // Test the connection with a simple operation
      const testDb = testClient.db(dbName);
      await testDb.command({ ping: 1 });
      
      console.log('Server: MongoDB connection test successful');
      
      // Close the test client
      await testClient.close();
      
      // Now set up the actual client for subsequent operations
      if (!mongoClient) {
        console.log('Server: Creating new MongoDB client for ongoing use');
        mongoClient = new MongoClient(mongoUri, {
          serverSelectionTimeoutMS: 10000,  // Shorter timeouts for the persistent client (reduced from 30s)
          connectTimeoutMS: 10000,         // (reduced from 30s)
          socketTimeoutMS: 20000,         // (reduced from 60s)
        });
        
        await mongoClient.connect();
        db = mongoClient.db(dbName);
        console.log(`Server: MongoDB connected successfully to database: ${dbName}`);
      } else {
        console.log('Server: Using existing MongoDB client');
      }
      
      return { 
        status: 'ok', 
        connected: true,
        statusCode: 200
      };
    } catch (error) {
      console.error('Server: MongoDB connection test error:', error);
      
      // Close the test client if it was created
      if (testClient) {
        try {
          await testClient.close();
        } catch (closeError) {
          console.error('Server: Error closing test client:', closeError);
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Server: MongoDB connection error:', error);
    
    // Close the client if connection failed
    if (mongoClient) {
      console.log('Server: Closing MongoDB client due to connection error');
      try {
        await mongoClient.close();
      } catch (closeError) {
        console.error('Server: Error closing client:', closeError);
      }
      mongoClient = null;
      db = null;
    }
    
    return { 
      status: 'error', 
      connected: false, 
      message: error.message || 'Unknown MongoDB connection error',
      statusCode: 500
    };
  }
};

// Make the MongoDB client and db available for other modules
export const getMongoClient = () => mongoClient;
export const getDb = () => db;

// Close the MongoDB connection - useful for cleanup
export const closeMongoConnection = async () => {
  if (mongoClient) {
    try {
      await mongoClient.close();
      mongoClient = null;
      db = null;
      console.log('Server: MongoDB connection closed');
      return true;
    } catch (error) {
      console.error('Server: Error closing MongoDB connection:', error);
      return false;
    }
  }
  return true;
};
