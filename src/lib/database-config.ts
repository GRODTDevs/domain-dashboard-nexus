
// Database configuration for SQLite

let DATABASE_INSTALLED = false;
let CONNECTION_STRING = "";

/**
 * Check if the database has been installed/initialized
 */
export const isDatabaseInstalled = (): boolean => {
  console.log('Checking if database is installed...');
  
  // First check environment variable (server-side)
  if (typeof process !== 'undefined' && process.env && process.env.SQLITE_INSTALLED === 'true') {
    console.log('Database is marked as installed via environment variable');
    return true;
  }
  
  // Then check localStorage (client-side)
  try {
    const installed = localStorage.getItem('sqlite_installed');
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
    localStorage.setItem('sqlite_installed', installed ? 'true' : 'false');
  } catch (error) {
    console.warn('Could not save database installation status', error);
  }
};

/**
 * Get the database connection string (for SQLite, this is the file path)
 */
export const getDatabaseConnectionString = (): string => {
  try {
    // For SQLite, we don't need an external connection string, but we'll 
    // maintain API compatibility with previous MongoDB implementation
    return CONNECTION_STRING || 'sqlite://data/database.sqlite';
  } catch (error) {
    console.warn('Could not get database connection string', error);
    return '';
  }
};

/**
 * Set the database connection string 
 * (For SQLite, this can be used to specify a custom file path)
 */
export const setDatabaseConnectionString = (connectionString: string): void => {
  console.log(`Setting database connection string: ${connectionString}`);
  CONNECTION_STRING = connectionString;
  
  try {
    localStorage.setItem('sqlite_connection', connectionString);
  } catch (error) {
    console.warn('Could not save database connection string', error);
  }
};

/**
 * Validate connection string format
 * (For SQLite, we just check if it starts with sqlite:// or has a .sqlite extension)
 */
export const validateConnectionString = (connectionString: string): boolean => {
  return connectionString.startsWith('sqlite://') || 
         connectionString.endsWith('.sqlite') || 
         connectionString.includes('database.sqlite');
};

/**
 * Check if database is configured
 * For SQLite, this always returns true since we don't need external connection strings
 */
export const isDatabaseConfigured = (): boolean => {
  return true;
};

/**
 * Initialize the database configuration
 */
export const initializeDatabase = async (): Promise<boolean> => {
  console.log('Initializing database configuration...');
  setDatabaseInstalled(true);
  return true;
};
