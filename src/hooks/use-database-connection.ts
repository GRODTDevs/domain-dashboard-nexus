
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
      console.log("Dialog: Connecting with MongoDB");
      
      if (connectionString) {
        console.log("Dialog: Validating MongoDB connection string");
        if (!validateConnectionString(connectionString)) {
          throw new Error("Invalid MongoDB connection string format. Should start with mongodb:// or mongodb+srv://");
        }
        
        console.log("Dialog: Setting MongoDB database connection string");
        setDatabaseConnectionString(connectionString);
      }
      
      console.log("Dialog: Testing MongoDB connection");
      
      // Call the backend API to test the connection
      const response = await fetch('/api/db/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || "Failed to connect to MongoDB");
      }
      
      setDatabaseInstalled(true);
            
      toast({
        title: "MongoDB Connection Configured",
        description: "Your MongoDB database has been successfully connected."
      });
      
      return true;
    } catch (error) {
      console.error("Dialog: Error connecting to MongoDB database:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setConnectionError(errorMessage);
      
      toast({
        title: "MongoDB Connection Error",
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
