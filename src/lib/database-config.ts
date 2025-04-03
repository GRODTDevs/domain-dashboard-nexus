
// Database configuration

import { MongoClient } from 'mongodb';

// This is where you'll store your database connection string
// For security, this should be loaded from an environment variable
let DATABASE_URL = '';
let mongoClient: MongoClient | null = null;

/**
 * Set the database connection string
 * @param connectionString The database connection string
 */
export const setDatabaseConnectionString = (connectionString: string) => {
  DATABASE_URL = connectionString;
  // Store in localStorage for persistence (only for development/demo purposes)
  // In production, this should use proper environment variables
  localStorage.setItem('database_connection_string', connectionString);
  console.log('Database connection string has been set');
  return true;
};

/**
 * Get the current database connection string
 * @returns The current database connection string
 */
export const getDatabaseConnectionString = (): string => {
  // If the connection string isn't set in memory, try to load from localStorage
  if (!DATABASE_URL) {
    DATABASE_URL = localStorage.getItem('database_connection_string') || '';
  }
  return DATABASE_URL;
};

/**
 * Check if the database connection string is set
 * @returns True if the connection string is set, false otherwise
 */
export const isDatabaseConfigured = (): boolean => {
  return !!getDatabaseConnectionString();
};

/**
 * Get the MongoDB client
 * @returns The MongoDB client instance
 */
export const getMongoClient = (): MongoClient | null => {
  return mongoClient;
};

/**
 * Set the MongoDB client instance
 * @param client The MongoDB client to set
 */
export const setMongoClient = (client: MongoClient | null): void => {
  mongoClient = client;
};

/**
 * Initialize the database connection
 * This creates a MongoDB client and connects to the database
 */
export const initializeDatabase = async (): Promise<boolean> => {
  const connectionString = getDatabaseConnectionString();
  
  if (!connectionString) {
    console.error('Database connection string is not set');
    return false;
  }
  
  try {
    if (mongoClient) {
      // Close the existing connection if there is one
      await mongoClient.close();
    }
    
    console.log('Initializing MongoDB connection with string:', 
      connectionString.substring(0, 10) + '...');
    
    // Create a new MongoDB client
    const client = new MongoClient(connectionString);
    
    // Connect to the server
    await client.connect();
    
    // Verify the connection
    await client.db('admin').command({ ping: 1 });
    
    // Store the client
    setMongoClient(client);
    
    console.log('MongoDB connection initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    return false;
  }
};
