
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { initializeStorage, isDatabaseInstalled } from "@/lib/db";
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { setDatabaseConnectionString, isDatabaseConfigured, isDatabaseInstalled as configIsDatabaseInstalled, validateConnectionString } from "@/lib/database-config";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DatabaseConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatabaseConnectionDialog({ isOpen, onOpenChange }: DatabaseConnectionDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionString, setConnectionString] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [installStatus, setInstallStatus] = useState(configIsDatabaseInstalled());
  const [envVariablePresent, setEnvVariablePresent] = useState(false);
  const { toast } = useToast();

  // Load existing connection string from env if available
  useEffect(() => {
    if (isOpen) {
      const hasEnvVar = !!import.meta.env.VITE_MONGODB_URI;
      setEnvVariablePresent(hasEnvVar);
      
      if (hasEnvVar) {
        setConnectionString('(Using connection string from environment variable)');
        console.log("Dialog: Using MongoDB connection string from environment variable");
      } else {
        console.log("Dialog: No MongoDB connection string from environment variable");
        try {
          const savedString = localStorage.getItem('mongodb_uri');
          if (savedString) {
            setConnectionString(savedString);
            console.log("Dialog: Loaded connection string from localStorage");
          }
        } catch (error) {
          console.warn("Dialog: Could not load connection string from localStorage", error);
        }
      }
      
      setInstallStatus(configIsDatabaseInstalled());
      setConnectionError(null);
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      if (!connectionString && !import.meta.env.VITE_MONGODB_URI) {
        throw new Error("MongoDB connection string is required");
      }
      
      console.log("Dialog: Connecting with connection string");
      
      // If we have a user-provided string and not just using the env var
      if (connectionString && !connectionString.includes('(Using connection string from environment variable)')) {
        console.log("Dialog: Validating user-provided connection string");
        if (!validateConnectionString(connectionString)) {
          throw new Error("Invalid MongoDB connection string format. Should start with mongodb:// or mongodb+srv://");
        }
        
        // Store the connection string
        console.log("Dialog: Setting database connection string");
        setDatabaseConnectionString(connectionString);
      }
      
      console.log("Dialog: Testing connection via API");
      
      try {
        // Test the connection via API
        const response = await fetch('/api/db/status' + 
          (connectionString && !connectionString.includes('(Using') ? 
            `?uri=${encodeURIComponent(connectionString)}` : ''));
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to connect to MongoDB");
        }
        
        const data = await response.json();
        console.log("Dialog: Connection status response:", data);
        
        if (!data.connected) {
          throw new Error("Could not connect to MongoDB. Please check your connection string.");
        }
        
        // Initialize database if needed
        if (!configIsDatabaseInstalled()) {
          console.log("Dialog: Initializing database");
          const initResponse = await fetch('/api/db/init', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
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
      
      // Force page refresh to apply the new connection
      window.location.reload();
      
    } catch (error) {
      console.error("Dialog: Error connecting to database:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setConnectionError(errorMessage);
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>MongoDB Connection</DialogTitle>
          <DialogDescription>
            Configure your MongoDB connection string
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Environment variable status */}
          <Alert variant={envVariablePresent ? "default" : "destructive"}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {envVariablePresent 
                ? "Using MongoDB connection string from environment variable."
                : "No VITE_MONGODB_URI environment variable found."}
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-2">
            <Label htmlFor="connection-string">MongoDB Connection String</Label>
            <Input 
              id="connection-string"
              type="text"
              placeholder={import.meta.env.VITE_MONGODB_URI ? 
                "(Using connection string from environment variable)" : 
                "mongodb://username:password@host:port/database"}
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              className="w-full"
              disabled={!!import.meta.env.VITE_MONGODB_URI}
            />
            {import.meta.env.VITE_MONGODB_URI ? (
              <p className="text-xs text-muted-foreground">
                Using MongoDB connection string from environment variable. To override, remove the VITE_MONGODB_URI environment variable.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enter your MongoDB connection string to connect to your database. 
                Alternatively, you can set the VITE_MONGODB_URI environment variable.
              </p>
            )}
          </div>
          
          {/* Connection error */}
          {connectionError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{connectionError}</span>
            </div>
          )}
          
          {/* Installation status */}
          {installStatus && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Database initialized with collections and sample data</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleConnect}
          >
            {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isConnecting ? 'Connecting...' : 'Connect to MongoDB'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
