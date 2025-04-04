
import { updateStorageStatus } from './storage-status';
import { initializeSqlite, closeSqliteDb } from './sqlite-adapter';

// Initialize database
export const initializeDb = async () => {
  try {
    console.log("DB: Initializing database");
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
  await closeSqliteDb();
  console.log("DB: Database connection closed");
};

// Import functions to re-export
import { initializeStorage, isStorageInitialized, getStorageError } from './initialization';
export { initializeStorage, isStorageInitialized, getStorageError };
