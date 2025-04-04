
// Database Management

import { initializeStorage, isStorageInitialized, getStorageError } from './db/initialization';
import { getDb } from './db/operations';
import { closeDb } from './db/connection';

// Re-export from modules
export { 
  initializeStorage,
  isStorageInitialized,
  getStorageError,
  getDb,
  closeDb
};

// Check if database is connected
export const isDbConnected = () => {
  const status = isStorageInitialized();
  console.log("DB: Database connection status:", status);
  return status;
};

// Get connection error
export const getConnectionError = () => {
  return getStorageError();
};

// Initialize database with optional config
export const initializeDb = async () => {
  try {
    console.log("DB: Starting database initialization");    
    return await initializeStorage();
  } catch (error) {
    console.error("DB: Failed to initialize database:", error);
    return false;
  }
};

// Check if using external database - now always false for SQLite
export const isUsingExternalDatabase = () => false;
