
// Managing MongoDB connection state
let connectionStatus = {
  connected: false,
  connectionString: "",
  error: null as string | null
};

// This is a mock version that works in the browser
export const initializeDb = async (mongoUri: string) => {
  try {
    // Simulate a connection attempt
    console.log("Attempting to connect to MongoDB with URI:", mongoUri);
    
    // In a real application, we would make an API call to a backend service
    // that would handle the actual MongoDB connection
    
    // Store connection information for future reference
    connectionStatus.connectionString = mongoUri;
    connectionStatus.connected = true;
    connectionStatus.error = null;
    
    console.log("Mock MongoDB connection established");
    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    connectionStatus.error = error instanceof Error ? error.message : "Unknown error";
    connectionStatus.connected = false;
    return false;
  }
};

export const getDb = () => {
  if (!connectionStatus.connected) {
    console.warn("MongoDB client not initialized or connected");
    return null;
  }
  
  // This is a mock implementation that would normally return the database instance
  // In a real application, this would return the database connection
  return {
    collection: (collectionName: string) => ({
      find: () => ({ 
        toArray: async () => {
          console.log(`Mock find operation on ${collectionName}`);
          return []; 
        }
      }),
      findOne: async () => {
        console.log(`Mock findOne operation on ${collectionName}`);
        return null;
      },
      insertOne: async (doc: any) => {
        console.log(`Mock insertOne operation on ${collectionName}`, doc);
        return { insertedId: "mock-id" };
      },
      updateOne: async (filter: any, update: any) => {
        console.log(`Mock updateOne operation on ${collectionName}`, { filter, update });
        return { matchedCount: 1, modifiedCount: 1 };
      },
      deleteOne: async (filter: any) => {
        console.log(`Mock deleteOne operation on ${collectionName}`, filter);
        return { deletedCount: 1 };
      }
    })
  };
};

export const isDbConnected = () => {
  return connectionStatus.connected;
};

export const getConnectionError = () => {
  return connectionStatus.error;
};

export const closeDb = async () => {
  // In a real application, this would close the MongoDB connection
  connectionStatus.connected = false;
  connectionStatus.connectionString = "";
  connectionStatus.error = null;
  console.log("Mock MongoDB connection closed");
};
