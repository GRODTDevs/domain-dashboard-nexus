
// Main database module that exports all functionality
import { checkConnectionStatus, getMongoClient, getDb } from './connection.mjs';
import { initializeDatabase } from './initialization/index.mjs';

// Re-export all database functions
export {
  checkConnectionStatus,
  getMongoClient,
  getDb,
  initializeDatabase
};
