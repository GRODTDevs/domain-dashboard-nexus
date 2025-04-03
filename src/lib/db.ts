
// Managing MongoDB connection and state
import { MongoClient, Collection, Document } from 'mongodb';
import { getDatabaseConnectionString, isDatabaseConfigured, getMongoClient, setMongoClient, initializeDatabase as initMongoDb } from './database-config';

let storageStatus = {
  initialized: false,
  error: null as string | null,
  usingExternalDb: false
};

// Initialize storage
export const initializeStorage = async (isPersistent: boolean = true) => {
  try {
    console.log("Initializing storage");
    
    // Store the persistence preference
    localStorage.setItem("data_persistence_enabled", isPersistent.toString());
    
    // Check if external database is configured
    storageStatus.usingExternalDb = isDatabaseConfigured();
    
    // If using MongoDB, initialize the connection
    if (storageStatus.usingExternalDb) {
      const success = await initMongoDb();
      if (!success) {
        throw new Error("Failed to initialize MongoDB connection");
      }
    } else {
      // Initialize empty collections in localStorage as fallback
      if (!localStorage.getItem("domains")) {
        localStorage.setItem("domains", JSON.stringify([]));
      }
    }
    
    storageStatus.initialized = true;
    storageStatus.error = null;
    
    console.log("Storage initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    storageStatus.error = error instanceof Error ? error.message : "Unknown error";
    storageStatus.initialized = false;
    return false;
  }
};

export const isStorageInitialized = () => {
  return storageStatus.initialized || localStorage.getItem("data_persistence_enabled") !== null;
};

export const getStorageError = () => {
  return storageStatus.error;
};

// Initialize database
export const initializeDb = async (mongoUri: string = "") => {
  try {
    // If a connection string is provided, use it
    if (mongoUri) {
      // Initialize a MongoDB client
      console.log("Initializing with provided connection string");
    } else {
      // Otherwise use the stored connection string if available
      const existingConnectionString = getDatabaseConnectionString();
      if (existingConnectionString) {
        console.log("Using existing connection string");
      } else {
        console.log("No connection string found, falling back to local storage");
      }
    }
    
    return await initializeStorage();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};

// Get database connection or fallback to localStorage
export const getDb = () => {
  if (!isStorageInitialized()) {
    console.warn("Storage not initialized");
    return null;
  }
  
  const client = getMongoClient();
  
  if (client) {
    // Use MongoDB
    return {
      collection: (collectionName: string) => {
        const db = client.db();
        return {
          find: () => ({ 
            toArray: async () => {
              console.log(`Getting all items from MongoDB collection ${collectionName}`);
              try {
                return await db.collection(collectionName).find().toArray();
              } catch (error) {
                console.error(`Error getting items from MongoDB collection ${collectionName}:`, error);
                return [];
              }
            }
          }),
          findOne: async (filter: any) => {
            console.log(`Getting item from MongoDB collection ${collectionName}`, filter);
            try {
              return await db.collection(collectionName).findOne(filter);
            } catch (error) {
              console.error(`Error finding item in MongoDB collection ${collectionName}:`, error);
              return null;
            }
          },
          insertOne: async (doc: any) => {
            console.log(`Adding item to MongoDB collection ${collectionName}`, doc);
            try {
              const result = await db.collection(collectionName).insertOne(doc);
              return { insertedId: result.insertedId };
            } catch (error) {
              console.error(`Error inserting item into MongoDB collection ${collectionName}:`, error);
              throw error;
            }
          },
          updateOne: async (filter: any, update: any) => {
            console.log(`Updating item in MongoDB collection ${collectionName}`, { filter, update });
            try {
              const result = await db.collection(collectionName).updateOne(filter, update);
              return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
            } catch (error) {
              console.error(`Error updating item in MongoDB collection ${collectionName}:`, error);
              throw error;
            }
          },
          deleteOne: async (filter: any) => {
            console.log(`Deleting item from MongoDB collection ${collectionName}`, filter);
            try {
              const result = await db.collection(collectionName).deleteOne(filter);
              return { deletedCount: result.deletedCount };
            } catch (error) {
              console.error(`Error deleting item from MongoDB collection ${collectionName}:`, error);
              throw error;
            }
          }
        };
      }
    };
  } else {
    // Fallback to localStorage
    console.log("MongoDB client not available, falling back to localStorage");
    return {
      collection: (collectionName: string) => ({
        find: () => ({ 
          toArray: async () => {
            console.log(`Getting all items from ${collectionName} in localStorage`);
            const data = localStorage.getItem(collectionName);
            return data ? JSON.parse(data) : []; 
          }
        }),
        findOne: async (filter: any) => {
          console.log(`Getting item from ${collectionName} in localStorage`, filter);
          const data = localStorage.getItem(collectionName);
          const items = data ? JSON.parse(data) : [];
          return items.find((item: any) => item.id === filter.id);
        },
        insertOne: async (doc: any) => {
          console.log(`Adding item to ${collectionName} in localStorage`, doc);
          const data = localStorage.getItem(collectionName);
          const items = data ? JSON.parse(data) : [];
          items.push(doc);
          localStorage.setItem(collectionName, JSON.stringify(items));
          return { insertedId: doc.id };
        },
        updateOne: async (filter: any, update: any) => {
          console.log(`Updating item in ${collectionName} in localStorage`, { filter, update });
          const data = localStorage.getItem(collectionName);
          const items = data ? JSON.parse(data) : [];
          const index = items.findIndex((item: any) => item.id === filter.id);
          if (index !== -1) {
            // Handle $set operator if present
            if (update.$set) {
              items[index] = { ...items[index], ...update.$set };
            } else {
              items[index] = { ...items[index], ...update };
            }
            localStorage.setItem(collectionName, JSON.stringify(items));
            return { matchedCount: 1, modifiedCount: 1 };
          }
          return { matchedCount: 0, modifiedCount: 0 };
        },
        deleteOne: async (filter: any) => {
          console.log(`Deleting item from ${collectionName} in localStorage`, filter);
          const data = localStorage.getItem(collectionName);
          const items = data ? JSON.parse(data) : [];
          const newItems = items.filter((item: any) => item.id !== filter.id);
          localStorage.setItem(collectionName, JSON.stringify(newItems));
          return { deletedCount: items.length - newItems.length };
        }
      })
    };
  }
};

export const isDbConnected = () => {
  return isStorageInitialized() && !!getMongoClient();
};

export const getConnectionError = () => {
  return getStorageError();
};

export const closeDb = async () => {
  const client = getMongoClient();
  if (client) {
    try {
      await client.close();
      setMongoClient(null);
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  }
  storageStatus.initialized = false;
};

export const isUsingExternalDatabase = () => {
  return storageStatus.usingExternalDb && !!getMongoClient();
};
