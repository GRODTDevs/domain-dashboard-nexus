
// Database configuration

// We'll store connection information but not attempt to connect from the browser
let DATABASE_URL = '';
let DATABASE_INSTALLED = false;

/**
 * Set the database connection string
 * @param connectionString The database connection string
 */
export const setDatabaseConnectionString = (connectionString: string) => {
  DATABASE_URL = connectionString;
  console.log('Database connection string has been set');
  
  // Save to localStorage for persistence across page reloads
  try {
    localStorage.setItem('mongodb_uri', connectionString);
  } catch (error) {
    console.warn('Could not save connection string to localStorage', error);
  }
  
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
  
  // Next, check if we have a saved connection string in localStorage
  try {
    const savedConnectionString = localStorage.getItem('mongodb_uri');
    if (savedConnectionString) {
      console.log('Using MongoDB connection string from localStorage');
      DATABASE_URL = savedConnectionString;
    }
  } catch (error) {
    console.warn('Could not load connection string from localStorage', error);
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
 * Check if the database has been installed
 * @returns True if the database has been installed, false otherwise
 */
export const isDatabaseInstalled = (): boolean => {
  try {
    const installed = localStorage.getItem('mongodb_installed');
    return installed === 'true';
  } catch (error) {
    console.warn('Could not check if database is installed', error);
    return false;
  }
};

/**
 * Set the database installation status
 * @param installed True if the database has been installed, false otherwise
 */
export const setDatabaseInstalled = (installed: boolean): void => {
  try {
    localStorage.setItem('mongodb_installed', installed ? 'true' : 'false');
  } catch (error) {
    console.warn('Could not save database installation status', error);
  }
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
