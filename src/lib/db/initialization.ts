
import { updateStorageStatus, isStorageInitialized } from './storage-status';
import { initializeSqlite } from './sqlite-adapter';

// Initialize storage
export const initializeStorage = async () => {
  try {
    console.log("DB: Initializing database connection");
    
    // Initialize SQLite database
    await initializeSqlite();
    
    console.log("DB: Database connection initialized successfully.");
    return true;
  } catch (error) {
    console.error("DB: Failed to initialize database connection:", error);
    updateStorageStatus({
      error: error instanceof Error ? error.message : "Unknown error",
      initialized: true // Important: we must still mark as initialized even on error
    });
    throw error;
  }
};

// Re-export functions from storage-status to maintain API compatibility
export { isStorageInitialized, getStorageError } from './storage-status';
