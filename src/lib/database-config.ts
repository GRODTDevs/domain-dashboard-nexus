
// Database configuration
import { parse as parseUrl } from 'url';

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
    console.log('Saved connection string to localStorage');
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
  console.log('Checking for MongoDB connection string...');
  
  // First check if we have an environment variable (for production/deployment)
  if (import.meta.env.VITE_MONGODB_URI) {
    console.log('Found MongoDB connection string from VITE_MONGODB_URI environment variable');
    return import.meta.env.VITE_MONGODB_URI;
  }
  
  // Check if window._env_ is available (sometimes used for runtime env variables)
  if (typeof window !== 'undefined' && (window as any)._env_ && (window as any)._env_.MONGODB_URI) {
    console.log('Found MongoDB connection string from window._env_.MONGODB_URI');
    return (window as any)._env_.MONGODB_URI;
  }
  
  // Check if process.env is available (server-side)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.MONGODB_URI) {
      console.log('Found MongoDB connection string from process.env.MONGODB_URI');
      return process.env.MONGODB_URI;
    }
  } catch (error) {
    console.warn('Error accessing process.env.MONGODB_URI', error);
  }
  
  // Next, check if we have a saved connection string in localStorage
  try {
    const savedConnectionString = localStorage.getItem('mongodb_uri');
    if (savedConnectionString) {
      console.log('Using MongoDB connection string from localStorage');
      DATABASE_URL = savedConnectionString;
      return savedConnectionString;
    }
  } catch (error) {
    console.warn('Could not load connection string from localStorage', error);
  }
  
  console.log('No MongoDB connection string found in environment variables or localStorage');
  return DATABASE_URL;
};

/**
 * Validate if a connection string has proper MongoDB format
 * @param connectionString The connection string to validate
 * @returns True if valid, false otherwise
 */
export const validateConnectionString = (connectionString: string): boolean => {
  if (!connectionString) return false;
  
  // Basic format check
  if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
    console.log('Connection string does not start with mongodb:// or mongodb+srv://');
    return false;
  }
  
  try {
    // Parse the URL to check for basic components
    const parsedUrl = parseUrl(connectionString);
    if (!parsedUrl.hostname) {
      console.log('Connection string is missing hostname');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to parse MongoDB connection string:', error);
    return false;
  }
};

/**
 * Check if the database connection string is set
 * @returns True if the connection string is set, false otherwise
 */
export const isDatabaseConfigured = (): boolean => {
  const connectionString = getDatabaseConnectionString();
  console.log(`Database configured: ${!!connectionString}`);
  return !!connectionString;
};

/**
 * Check if the database has been installed
 * @returns True if the database has been installed, false otherwise
 */
export const isDatabaseInstalled = (): boolean => {
  console.log('Checking if database is installed...');
  
  // First check environment variable (server-side)
  if (typeof process !== 'undefined' && process.env && process.env.MONGODB_INSTALLED === 'true') {
    console.log('Database is marked as installed via environment variable');
    return true;
  }
  
  // Then check localStorage (client-side)
  try {
    const installed = localStorage.getItem('mongodb_installed');
    console.log(`Database installation status from localStorage: ${installed}`);
    return installed === 'true';
  } catch (error) {
    console.warn('Could not check if database is installed from localStorage', error);
    return false;
  }
};

/**
 * Set the database installation status
 * @param installed True if the database has been installed, false otherwise
 */
export const setDatabaseInstalled = (installed: boolean): void => {
  console.log(`Setting database installed status to: ${installed}`);
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
  console.log('Initializing database configuration...');
  const connectionString = getDatabaseConnectionString();
  
  if (!connectionString) {
    console.error('Database connection string is not set');
    return false;
  }
  
  try {
    // Validate that the string looks like a MongoDB connection string
    if (!validateConnectionString(connectionString)) {
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
