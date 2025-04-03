
// Managing storage for the browser environment

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
    const connectionString = localStorage.getItem('database_connection_string');
    storageStatus.usingExternalDb = !!connectionString;
    
    // Initialize empty collections in localStorage as fallback
    if (!localStorage.getItem("domains")) {
      localStorage.setItem("domains", JSON.stringify([]));
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
    // Store connection string if provided
    if (mongoUri) {
      localStorage.setItem('database_connection_string', mongoUri);
      console.log("Stored connection string");
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
  
  // In browser environment, always use localStorage
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
};

export const isDbConnected = () => {
  return isStorageInitialized();
};

export const getConnectionError = () => {
  return getStorageError();
};

export const closeDb = async () => {
  // Nothing to close in localStorage implementation
  console.log("Storage connection closed");
};

export const isUsingExternalDatabase = () => {
  // In browser environment, we're just simulating this
  return storageStatus.usingExternalDb;
};
