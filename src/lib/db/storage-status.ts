
// Storage Status Management

// Track database connection state
let storageStatus = {
  initialized: false,
  error: null as string | null,
  usingExternalDb: true,
  installed: false
};

// Get initialization status
export const isStorageInitialized = () => {
  return storageStatus.initialized;
};

// Get storage error
export const getStorageError = () => {
  return storageStatus.error;
};

// Get installation status
export const isDatabaseInstalled = () => {
  return storageStatus.installed;
};

// Update storage status
export const updateStorageStatus = (
  status: { 
    initialized?: boolean; 
    error?: string | null;
    usingExternalDb?: boolean;
    installed?: boolean;
  }
) => {
  storageStatus = { ...storageStatus, ...status };
};

// Check if using external database - Always true for MongoDB
export const isUsingExternalDatabase = () => {
  return true;
};
