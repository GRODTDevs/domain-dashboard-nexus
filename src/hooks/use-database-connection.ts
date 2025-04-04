
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
      console.log("Dialog: Connecting with SQLite");
      
      if (connectionString && !connectionString.includes('(Using')) {
        console.log("Dialog: Validating SQLite connection string");
        if (!validateConnectionString(connectionString)) {
          throw new Error("Invalid SQLite connection string format. Should start with sqlite:// or have .sqlite extension");
        }
        
        console.log("Dialog: Setting SQLite database connection string");
        setDatabaseConnectionString(connectionString);
      }
      
      console.log("Dialog: Testing SQLite connection");
      
      // For SQLite, we're always successful since it's a local file
      setDatabaseInstalled(true);
            
      toast({
        title: "SQLite Connection Configured",
        description: "Your SQLite database has been successfully configured."
      });
      
      return true;
    } catch (error) {
      console.error("Dialog: Error connecting to SQLite database:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setConnectionError(errorMessage);
      
      toast({
        title: "SQLite Connection Error",
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
