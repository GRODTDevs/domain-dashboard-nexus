
// Managing local storage state
let storageStatus = {
  initialized: false,
  error: null as string | null
};

// Initialize local storage for domain data
export const initializeStorage = async (isPersistent: boolean = true) => {
  try {
    // Set up local storage for our application
    console.log("Initializing local storage");
    
    // Store the persistence preference
    localStorage.setItem("data_persistence_enabled", isPersistent.toString());
    
    // Initialize empty collections if they don't exist
    if (!localStorage.getItem("domains")) {
      localStorage.setItem("domains", JSON.stringify([]));
    }
    
    storageStatus.initialized = true;
    storageStatus.error = null;
    
    console.log("Local storage initialized");
    return true;
  } catch (error) {
    console.error("Failed to initialize local storage:", error);
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

// Mock MongoDB functions that now use localStorage instead
export const initializeDb = async (mongoUri: string = "") => {
  // We're no longer doing MongoDB simulation, just fall back to local storage
  return await initializeStorage();
};

export const getDb = () => {
  // This is now just a localStorage wrapper
  if (!isStorageInitialized()) {
    console.warn("Storage not initialized");
    return null;
  }
  
  return {
    collection: (collectionName: string) => ({
      find: () => ({ 
        toArray: async () => {
          console.log(`Getting all items from ${collectionName}`);
          const data = localStorage.getItem(collectionName);
          return data ? JSON.parse(data) : []; 
        }
      }),
      findOne: async (filter: any) => {
        console.log(`Getting item from ${collectionName}`, filter);
        const data = localStorage.getItem(collectionName);
        const items = data ? JSON.parse(data) : [];
        return items.find((item: any) => item.id === filter.id);
      },
      insertOne: async (doc: any) => {
        console.log(`Adding item to ${collectionName}`, doc);
        const data = localStorage.getItem(collectionName);
        const items = data ? JSON.parse(data) : [];
        items.push(doc);
        localStorage.setItem(collectionName, JSON.stringify(items));
        return { insertedId: doc.id };
      },
      updateOne: async (filter: any, update: any) => {
        console.log(`Updating item in ${collectionName}`, { filter, update });
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
        console.log(`Deleting item from ${collectionName}`, filter);
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
  storageStatus.initialized = false;
  console.log("Local storage connection closed");
};
