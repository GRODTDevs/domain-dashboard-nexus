
// Database configuration

// We'll store connection information but not attempt to connect from the browser
let DATABASE_URL = '';

/**
 * Set the database connection string
 * @param connectionString The database connection string
 */
export const setDatabaseConnectionString = (connectionString: string) => {
  DATABASE_URL = connectionString;
  console.log('Database connection string has been set');
  return true;
};

/**
 * Get the current database connection string
 * @returns The current database connection string
 */
export const getDatabaseConnectionString = (): string => {
  // First check if we have an environment variable (for production/deployment)
  if (import.meta.env.VITE_MONGODB_URI) {
    console.log('Using MongoDB connection string from environment variable');
    return import.meta.env.VITE_MONGODB_URI;
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
 * Initialize the database connection
 * This validates the connection string format
 */
export const initializeDatabase = async (): Promise<boolean> => {
  const connectionString = getDatabaseConnectionString();
  
  if (!connectionString) {
    console.error('Database connection string is not set');
    return false;
  }
  
  try {
    // Validate that the string looks like a MongoDB connection string
    if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
      console.error('Invalid MongoDB connection string format');
      return false;
    }
    
    console.log('MongoDB connection string format is valid');
    return true;
  } catch (error) {
    console.error('Failed to validate database connection:', error);
    return false;
  }
};
