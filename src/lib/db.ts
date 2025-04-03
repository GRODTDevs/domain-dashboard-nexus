
import { MongoClient } from "mongodb";

// Will be set from environment or passed in by user
let connectionString = "";

let client: MongoClient | null = null;

export const initializeDb = async (mongoUri: string) => {
  // Store the connection string for future use
  connectionString = mongoUri;
  
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return false;
  }
};

export const getDb = () => {
  if (!client) {
    // If no client exists but we have a connection string, try to connect
    if (connectionString) {
      console.warn("DB client not initialized, attempting to connect...");
      return new MongoClient(connectionString).db("domain-manager");
    }
    console.error("MongoDB client not initialized!");
    return null;
  }
  return client.db("domain-manager");
};

export const isDbConnected = () => {
  return !!client;
};

// Used for cleanup on application shutdown (not typically needed in browser)
export const closeDb = async () => {
  if (client) {
    await client.close();
    client = null;
    console.log("MongoDB connection closed");
  }
};
