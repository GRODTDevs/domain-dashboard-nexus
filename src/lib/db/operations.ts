
import { isStorageInitialized } from './storage-status';
import { getCollection } from './sqlite-adapter';

// Get database operations interface
export const getDb = () => {
  if (!isStorageInitialized()) {
    console.warn("DB: Database connection not initialized");
    return null;
  }
  
  return {
    collection: getCollection
  };
};
