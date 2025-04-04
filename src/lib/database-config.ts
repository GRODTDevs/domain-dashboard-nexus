
// Database configuration for MongoDB

let DATABASE_INSTALLED = false;
let CONNECTION_STRING = "";

/**
 * Check if the database has been installed/initialized
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
    return DATABASE_INSTALLED;
  }
};

/**
 * Set the database installation status
 */
export const setDatabaseInstalled = (installed: boolean): void => {
  console.log(`Setting database installed status to: ${installed}`);
  DATABASE_INSTALLED = installed;
  
  try {
    localStorage.setItem('mongodb_installed', installed ? 'true' : 'false');
  } catch (error) {
    console.warn('Could not save database installation status', error);
  }
};

/**
 * Get the database connection string
 */
export const getDatabaseConnectionString = (): string => {
  try {
    // Check for connection string in localStorage
    const storedUri = localStorage.getItem('mongodb_uri');
    if (storedUri) return storedUri;
    
    // Use environment variable as fallback
    return CONNECTION_STRING || process.env.VITE_MONGODB_URI || '';
  } catch (error) {
    console.warn('Could not get database connection string', error);
    return '';
  }
};

/**
 * Set the database connection string 
 */
export const setDatabaseConnectionString = (connectionString: string): void => {
  console.log(`Setting database connection string: ${connectionString}`);
  CONNECTION_STRING = connectionString;
  
  try {
    localStorage.setItem('mongodb_uri', connectionString);
  } catch (error) {
    console.warn('Could not save database connection string', error);
  }
};

/**
 * Validate connection string format for MongoDB
 */
export const validateConnectionString = (connectionString: string): boolean => {
  return connectionString.startsWith('mongodb://') || 
         connectionString.startsWith('mongodb+srv://');
};

/**
 * Check if database is configured
 */
export const isDatabaseConfigured = (): boolean => {
  const connectionString = getDatabaseConnectionString();
  return !!connectionString;
};

/**
 * Initialize the database configuration
 */
export const initializeDatabase = async (): Promise<boolean> => {
  console.log('Initializing database configuration...');
  // We'll now rely on the Python backend for actual initialization
  return true;
};
