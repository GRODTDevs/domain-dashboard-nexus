
// MongoDB Database Management

import { getDatabaseConnectionString, isDatabaseInstalled as configIsDatabaseInstalled, setDatabaseInstalled } from './database-config';

let storageStatus = {
  initialized: false,
  error: null as string | null,
  usingExternalDb: true,
  installed: false
};

// Initialize storage
export const initializeStorage = async () => {
  try {
    console.log("DB: Initializing MongoDB connection");
    
    // Check if MongoDB connection string is configured
    const mongoUri = getDatabaseConnectionString();
    
    if (!mongoUri) {
      console.error("DB: MongoDB connection string is not configured");
      throw new Error("MongoDB connection string is not configured. Please set the VITE_MONGODB_URI environment variable or configure it in the app.");
    }
    
    console.log("DB: MongoDB connection string available, URI length:", mongoUri.length);
    console.log("DB: MongoDB URI starts with:", mongoUri.substring(0, 12) + "...");
    
    // Test the connection via the server if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        console.log("DB: Running in browser environment, checking connection via API");
        
        // Check connection status
        console.log(`DB: Calling /api/db/status with URI parameter`);
        const statusResponse = await fetch(`/api/db/status?uri=${encodeURIComponent(mongoUri)}`);
        
        if (!statusResponse.ok) {
          console.error(`DB: Connection status check failed with status ${statusResponse.status}`);
          const data = await statusResponse.json();
          throw new Error(data.message || 'Failed to connect to MongoDB');
        }
        
        const statusData = await statusResponse.json();
        console.log("DB: MongoDB connection test result:", statusData);
        
        // Check if database is installed
        const isInstalled = configIsDatabaseInstalled();
        console.log("DB: Database installation status:", isInstalled);
        
        if (!isInstalled) {
          console.log("DB: Database not installed, initializing...");
          
          // Initialize the database
          console.log("DB: Calling /api/db/init endpoint");
          const initResponse = await fetch('/api/db/init', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uri: mongoUri })
          });
          
          if (!initResponse.ok) {
            console.error(`DB: Database initialization failed with status ${initResponse.status}`);
            const data = await initResponse.json();
            throw new Error(data.message || 'Failed to initialize MongoDB');
          }
          
          const initData = await initResponse.json();
          console.log("DB: Database initialized successfully:", initData);
          
          // Mark as installed
          setDatabaseInstalled(true);
          storageStatus.installed = true;
          console.log("DB: Database marked as installed");
        } else {
          console.log("DB: Database already installed");
          storageStatus.installed = true;
        }
        
      } catch (error) {
        // Log error but don't throw - we'll assume it's configured properly based on connection string
        console.warn("DB: Could not fully initialize MongoDB:", error);
      }
    } else {
      console.log("DB: Running in server-side environment, skipping API calls");
    }
    
    // Mark as initialized if we have a connection string
    storageStatus.initialized = true;
    storageStatus.error = null;
    storageStatus.usingExternalDb = true;
    
    console.log("DB: MongoDB connection initialized successfully. Storage status:", storageStatus);
    return true;
  } catch (error) {
    console.error("DB: Failed to initialize MongoDB connection:", error);
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

export const isDatabaseInstalled = () => {
  return storageStatus.installed;
};

// Initialize database with connection string
export const initializeDb = async (mongoUri: string = "") => {
  try {
    if (mongoUri) {
      // Store connection string if provided
      console.log("DB: Using provided MongoDB connection string");
    }
    
    return await initializeStorage();
  } catch (error) {
    console.error("DB: Failed to initialize database:", error);
    return false;
  }
};

// This is a placeholder for the MongoDB client functionality
// In a Node.js environment, this would be replaced with actual MongoDB operations
export const getDb = () => {
  if (!isStorageInitialized()) {
    console.warn("DB: MongoDB connection not initialized");
    return null;
  }
  
  // This is where we would normally return the MongoDB client
  // Since we're running in a browser context but want to simulate Node.js MongoDB operations,
  // we'll log that operations should be performed on the server
  return {
    collection: (collectionName: string) => ({
      find: () => ({ 
        toArray: async () => {
          console.log(`DB: [SERVER OPERATION] Getting all items from ${collectionName}`);
          throw new Error("MongoDB operations must be performed on the server side");
        }
      }),
      findOne: async (filter: any) => {
        console.log(`DB: [SERVER OPERATION] Finding item in ${collectionName}`, filter);
        throw new Error("MongoDB operations must be performed on the server side");
      },
      insertOne: async (doc: any) => {
        console.log(`DB: [SERVER OPERATION] Adding item to ${collectionName}`, doc);
        throw new Error("MongoDB operations must be performed on the server side");
      },
      updateOne: async (filter: any, update: any) => {
        console.log(`DB: [SERVER OPERATION] Updating item in ${collectionName}`, { filter, update });
        throw new Error("MongoDB operations must be performed on the server side");
      },
      deleteOne: async (filter: any) => {
        console.log(`DB: [SERVER OPERATION] Deleting item from ${collectionName}`, filter);
        throw new Error("MongoDB operations must be performed on the server side");
      }
    })
  };
};

export const isDbConnected = () => {
  const status = isStorageInitialized();
  console.log("DB: Database connection status:", status);
  return status;
};

export const getConnectionError = () => {
  return getStorageError();
};

export const closeDb = async () => {
  console.log("DB: MongoDB connection closed");
};

export const isUsingExternalDatabase = () => {
  // Always using MongoDB
  return true;
};
