
import { getDatabaseConnectionString, isDatabaseInstalled as configIsDatabaseInstalled, setDatabaseInstalled } from '../database-config';
import { updateStorageStatus, isStorageInitialized } from './storage-status';

// Initialize storage
export const initializeStorage = async () => {
  try {
    console.log("DB: Initializing MongoDB connection");
    
    // Check if MongoDB connection string is configured
    const mongoUri = getDatabaseConnectionString();
    
    if (!mongoUri) {
      console.error("DB: MongoDB connection string is not configured");
      throw new Error("MongoDB connection string is not configured. Please set the VITE_MONGODB_URI environment variable or configure it in the app.");
    }
    
    console.log("DB: MongoDB connection string available, URI length:", mongoUri.length);
    console.log("DB: MongoDB URI starts with:", mongoUri.substring(0, 12) + "...");
    
    // Test the connection via the server if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        console.log("DB: Running in browser environment, checking connection via API");
        
        // Check connection status with shorter timeout
        console.log(`DB: Calling /api/db/status with URI parameter`);
        
        // Create a fetch request with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        const statusResponse = await fetch(`/api/db/status?uri=${encodeURIComponent(mongoUri)}`, {
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        if (!statusResponse.ok) {
          console.error(`DB: Connection status check failed with status ${statusResponse.status}`);
          const data = await statusResponse.json();
          throw new Error(data.message || `Failed to connect to MongoDB with status ${statusResponse.status}`);
        }
        
        const statusData = await statusResponse.json();
        console.log("DB: MongoDB connection test result:", statusData);
        
        if (!statusData.connected) {
          throw new Error("Could not connect to MongoDB. Server reported failure.");
        }
        
        // Check if database is installed
        const isInstalled = configIsDatabaseInstalled();
        console.log("DB: Database installation status:", isInstalled);
        
        if (!isInstalled) {
          console.log("DB: Database not installed, initializing...");
          
          // Don't wait too long for initialization
          // This prevents us from hanging indefinitely
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
          
          try {
            const initResponse = await fetch('/api/db/init', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ uri: mongoUri }),
              signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
            
            if (!initResponse.ok) {
              console.error(`DB: Database initialization failed with status ${initResponse.status}`);
              const data = await initResponse.json();
              
              // Even if we get a server error, we'll still mark the client side as initialized
              // This allows the user to continue using the app even if the database isn't fully set up
              console.log("DB: Continuing despite initialization error");
              setDatabaseInstalled(true);
              updateStorageStatus({
                initialized: true,
                error: null
              });
              
              return true;
            }
            
            const initData = await initResponse.json();
            console.log("DB: Database initialized successfully:", initData);
            
            // Mark as installed
            setDatabaseInstalled(true);
            updateStorageStatus({ installed: true });
            console.log("DB: Database marked as installed");
          }
          catch (error) {
            console.error("DB: Database initialization request failed:", error);
            // We'll still mark the client side as initialized so the app can function
            // This prevents UI hanging indefinitely
            updateStorageStatus({ initialized: true });
            throw error;
          }
        } else {
          console.log("DB: Database already installed");
          updateStorageStatus({ installed: true });
        }
      } catch (error) {
        console.error("DB: Could not initialize MongoDB:", error);
        throw error;
      }
    } else {
      console.log("DB: Running in server-side environment, skipping API calls");
    }
    
    // Mark as initialized
    updateStorageStatus({
      initialized: true,
      error: null,
      usingExternalDb: true
    });
    
    console.log("DB: MongoDB connection initialized successfully.");
    return true;
  } catch (error) {
    console.error("DB: Failed to initialize MongoDB connection:", error);
    updateStorageStatus({
      error: error instanceof Error ? error.message : "Unknown error",
      initialized: true // Important: we must still mark as initialized even on error
    });
    throw error;
  }
};

// Re-export functions from storage-status to maintain API compatibility
export { isStorageInitialized, getStorageError } from './storage-status';
