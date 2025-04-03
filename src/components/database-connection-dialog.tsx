
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { initializeStorage, isStorageInitialized, isUsingExternalDatabase } from "@/lib/db";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { setDatabaseConnectionString, initializeDatabase } from "@/lib/database-config";

interface DatabaseConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatabaseConnectionDialog({ isOpen, onOpenChange }: DatabaseConnectionDialogProps) {
  const [isPersistent, setIsPersistent] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionString, setConnectionString] = useState('');
  const [useExternalDb, setUseExternalDb] = useState(true); // Default to using MongoDB
  const { toast } = useToast();

  // Load existing connection string if available
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('database_connection_string');
      if (stored) {
        setConnectionString(stored);
        setUseExternalDb(true);
      }
      
      const persistenceEnabled = localStorage.getItem('data_persistence_enabled');
      if (persistenceEnabled !== null) {
        setIsPersistent(persistenceEnabled === 'true');
      }
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // If using MongoDB, validate connection string
      if (useExternalDb) {
        if (!connectionString) {
          throw new Error("MongoDB connection string is required");
        }
        
        if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
          throw new Error("Invalid MongoDB connection string format. Should start with mongodb:// or mongodb+srv://");
        }
        
        // Store the connection string
        setDatabaseConnectionString(connectionString);
        
        // Try to initialize the database connection
        const dbConnected = await initializeDatabase();
        
        if (!dbConnected) {
          throw new Error("Failed to connect to MongoDB database");
        }
        
        toast({
          title: "MongoDB Connected",
          description: "Successfully connected to MongoDB database",
        });
      }
      
      // Initialize storage with the persistence preference
      const initialized = await initializeStorage(isPersistent);
      
      if (!initialized) {
        throw new Error("Failed to initialize storage");
      }
      
      // Store the persistence preference
      localStorage.setItem("data_persistence_enabled", isPersistent.toString());
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error connecting to database:", error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
            Configure your MongoDB database connection
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="persistence-toggle" className="text-sm font-medium">
                Enable data persistence
              </Label>
              <Switch
                id="persistence-toggle"
                checked={isPersistent}
                onCheckedChange={setIsPersistent}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, your domain data will be stored persistently.
            </p>
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="external-db-toggle" className="text-sm font-medium">
                Use MongoDB
              </Label>
              <Switch
                id="external-db-toggle"
                checked={useExternalDb}
                onCheckedChange={setUseExternalDb}
              />
            </div>
            {useExternalDb && (
              <div className="space-y-2">
                <Label htmlFor="connection-string">MongoDB Connection String</Label>
                <Input 
                  id="connection-string"
                  type="text"
                  placeholder="mongodb://username:password@host:port/database"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your MongoDB connection string. This should start with "mongodb://" or "mongodb+srv://".
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            disabled={isConnecting || (useExternalDb && !connectionString)} 
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
