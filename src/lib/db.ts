
// MongoDB Database Management

import { getDatabaseConnectionString } from './database-config';

let storageStatus = {
  initialized: false,
  error: null as string | null,
  usingExternalDb: true
};

// Initialize storage
export const initializeStorage = async () => {
  try {
    console.log("Initializing MongoDB connection");
    
    // Check if MongoDB connection string is configured
    const mongoUri = getDatabaseConnectionString();
    
    if (!mongoUri) {
      throw new Error("MongoDB connection string is not configured. Please set the VITE_MONGODB_URI environment variable or configure it in the app.");
    }
    
    // Test the connection via the server if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        // Simply ping the server to see if the connection works
        const response = await fetch('/api/db/status');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to connect to MongoDB');
        }
        
        console.log("MongoDB connection tested successfully via server API");
      } catch (error) {
        console.error("Failed to test MongoDB connection:", error);
        storageStatus.error = error instanceof Error ? error.message : "Connection test failed";
        storageStatus.initialized = false;
        return false;
      }
    }
    
    storageStatus.initialized = true;
    storageStatus.error = null;
    storageStatus.usingExternalDb = true;
    
    console.log("MongoDB connection initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize MongoDB connection:", error);
    storageStatus.error = error instanceof Error ? error.message : "Unknown error";
    storageStatus.initialized = false;
    return false;
  }
};

export const isStorageInitialized = () => {
  return storageStatus.initialized;
};

export const getStorageError = () => {
  return storageStatus.error;
};

// Initialize database with connection string
export const initializeDb = async (mongoUri: string = "") => {
  try {
    if (mongoUri) {
      // Store connection string if provided
      console.log("Using provided MongoDB connection string");
    }
    
    return await initializeStorage();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};

// This is a placeholder for the MongoDB client functionality
// In a Node.js environment, this would be replaced with actual MongoDB operations
export const getDb = () => {
  if (!isStorageInitialized()) {
    console.warn("MongoDB connection not initialized");
    return null;
  }
  
  // This is where we would normally return the MongoDB client
  // Since we're running in a browser context but want to simulate Node.js MongoDB operations,
  // we'll log that operations should be performed on the server
  return {
    collection: (collectionName: string) => ({
      find: () => ({ 
        toArray: async () => {
          console.log(`[SERVER OPERATION] Getting all items from ${collectionName}`);
          throw new Error("MongoDB operations must be performed on the server side");
        }
      }),
      findOne: async (filter: any) => {
        console.log(`[SERVER OPERATION] Finding item in ${collectionName}`, filter);
        throw new Error("MongoDB operations must be performed on the server side");
      },
      insertOne: async (doc: any) => {
        console.log(`[SERVER OPERATION] Adding item to ${collectionName}`, doc);
        throw new Error("MongoDB operations must be performed on the server side");
      },
      updateOne: async (filter: any, update: any) => {
        console.log(`[SERVER OPERATION] Updating item in ${collectionName}`, { filter, update });
        throw new Error("MongoDB operations must be performed on the server side");
      },
      deleteOne: async (filter: any) => {
        console.log(`[SERVER OPERATION] Deleting item from ${collectionName}`, filter);
        throw new Error("MongoDB operations must be performed on the server side");
      }
    })
  };
};

export const isDbConnected = () => {
  return isStorageInitialized();
};

export const getConnectionError = () => {
  return getStorageError();
};

export const closeDb = async () => {
  console.log("MongoDB connection closed");
};

export const isUsingExternalDatabase = () => {
  // Always using MongoDB
  return true;
};
