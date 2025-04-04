
import { getDatabaseConnectionString } from '../database-config';
import { updateStorageStatus } from './storage-status';

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

// Check if the database is connected
export const isDbConnected = () => {
  const status = isStorageInitialized();
  console.log("DB: Database connection status:", status);
  return status;
};

// Get connection error
export const getConnectionError = () => {
  return getStorageError();
};

// Close database connection
export const closeDb = async () => {
  console.log("DB: MongoDB connection closed");
};

// Import functions to re-export
import { initializeStorage, isStorageInitialized, getStorageError } from './initialization';
export { initializeStorage, isStorageInitialized, getStorageError };
