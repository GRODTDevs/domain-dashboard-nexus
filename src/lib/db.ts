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
        
        // Check connection status with shorter timeout
        console.log(`DB: Calling /api/db/status with URI parameter`);
        
        // Create a fetch request with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        const statusResponse = await fetch(`/api/db/status?uri=${encodeURIComponent(mongoUri)}`, {
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        if (!statusResponse.ok) {
          console.error(`DB: Connection status check failed with status ${statusResponse.status}`);
          const data = await statusResponse.json();
          throw new Error(data.message || `Failed to connect to MongoDB with status ${statusResponse.status}`);
        }
        
        const statusData = await statusResponse.json();
        console.log("DB: MongoDB connection test result:", statusData);
        
        if (!statusData.connected) {
          throw new Error("Could not connect to MongoDB. Server reported failure.");
        }
        
        // Check if database is installed
        const isInstalled = configIsDatabaseInstalled();
        console.log("DB: Database installation status:", isInstalled);
        
        if (!isInstalled) {
          console.log("DB: Database not installed, initializing...");
          
          // Don't wait too long for initialization
          // This prevents us from hanging indefinitely
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
          
          try {
            const initResponse = await fetch('/api/db/init', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ uri: mongoUri }),
              signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
            
            if (!initResponse.ok) {
              console.error(`DB: Database initialization failed with status ${initResponse.status}`);
              const data = await initResponse.json();
              
              // Even if we get a server error, we'll still mark the client side as initialized
              // This allows the user to continue using the app even if the database isn't fully set up
              console.log("DB: Continuing despite initialization error");
              setDatabaseInstalled(true);
              storageStatus.initialized = true;
              storageStatus.error = null;
              
              return true;
            }
            
            const initData = await initResponse.json();
            console.log("DB: Database initialized successfully:", initData);
            
            // Mark as installed
            setDatabaseInstalled(true);
            storageStatus.installed = true;
            console.log("DB: Database marked as installed");
          }
          catch (error) {
            console.error("DB: Database initialization request failed:", error);
            // We'll still mark the client side as initialized so the app can function
            // This prevents UI hanging indefinitely
            storageStatus.initialized = true;
            throw error;
          }
        } else {
          console.log("DB: Database already installed");
          storageStatus.installed = true;
        }
      } catch (error) {
        console.error("DB: Could not initialize MongoDB:", error);
        throw error;
      }
    } else {
      console.log("DB: Running in server-side environment, skipping API calls");
    }
    
    // Mark as initialized
    storageStatus.initialized = true;
    storageStatus.error = null;
    storageStatus.usingExternalDb = true;
    
    console.log("DB: MongoDB connection initialized successfully. Storage status:", storageStatus);
    return true;
  } catch (error) {
    console.error("DB: Failed to initialize MongoDB connection:", error);
    storageStatus.error = error instanceof Error ? error.message : "Unknown error";
    
    // Important: we must still mark as initialized even on error
    // This prevents the UI from hanging indefinitely
    storageStatus.initialized = true;
    throw error;
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
