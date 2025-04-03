
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  setDatabaseConnectionString, 
  isDatabaseConfigured, 
  isDatabaseInstalled as configIsDatabaseInstalled,
  validateConnectionString,
  setDatabaseInstalled
} from "@/lib/database-config";

export function useDatabaseConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();

  const connect = async (connectionString: string): Promise<boolean> => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      if (!connectionString && !import.meta.env.VITE_MONGODB_URI) {
        throw new Error("MongoDB connection string is required");
      }
      
      console.log("Dialog: Connecting with connection string");
      
      if (connectionString && !connectionString.includes('(Using connection string from environment variable)')) {
        console.log("Dialog: Validating user-provided connection string");
        if (!validateConnectionString(connectionString)) {
          throw new Error("Invalid MongoDB connection string format. Should start with mongodb:// or mongodb+srv://");
        }
        
        console.log("Dialog: Setting database connection string");
        setDatabaseConnectionString(connectionString);
      }
      
      console.log("Dialog: Testing connection via API");
      
      try {
        const apiUrl = '/api/db/status' + 
          (connectionString && !connectionString.includes('(Using') ? 
            `?uri=${encodeURIComponent(connectionString)}` : '');
        
        console.log(`Dialog: Making API request to ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || `Failed to connect to MongoDB. Server returned status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Dialog: Connection status response:", data);
        
        if (!data.connected) {
          throw new Error("Could not connect to MongoDB. Please check your connection string.");
        }
        
        if (!configIsDatabaseInstalled()) {
          console.log("Dialog: Initializing database");
          const initResponse = await fetch('/api/db/init', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              uri: connectionString && !connectionString.includes('(Using') ? 
                connectionString : undefined
            })
          });
          
          if (!initResponse.ok) {
            const initData = await initResponse.json();
            console.error("Dialog: Database initialization failed:", initData);
            throw new Error(initData.message || "Failed to initialize MongoDB database.");
          }
          
          const initData = await initResponse.json();
          console.log("Dialog: Database initialization succeeded:", initData);
          setDatabaseInstalled(true);
        }
      } catch (error) {
        console.error("Dialog: API connection test failed:", error);
        throw error;
      }
      
      toast({
        title: "MongoDB Connection Configured",
        description: "Your MongoDB connection has been successfully configured."
      });
      
      return true;
    } catch (error) {
      console.error("Dialog: Error connecting to database:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setConnectionError(errorMessage);
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    isConnecting,
    connectionError,
    connect,
    setConnectionError
  };
}
