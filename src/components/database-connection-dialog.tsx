
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { initializeStorage, isStorageInitialized } from "@/lib/db";
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
  const [useExternalDb, setUseExternalDb] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Initialize local storage for data persistence
      const initialized = await initializeStorage();
      
      if (!initialized) {
        throw new Error("Failed to initialize local storage");
      }
      
      // If using external database, also initialize that connection
      if (useExternalDb && connectionString) {
        setDatabaseConnectionString(connectionString);
        const dbConnected = await initializeDatabase();
        
        if (!dbConnected) {
          throw new Error("Failed to connect to external database");
        }
        
        toast({
          title: "Database Connected",
          description: "Successfully connected to external database",
        });
      } else {
        // Just using local storage
        toast({
          title: "Storage Initialized",
          description: "Successfully configured local storage for data persistence",
        });
      }
      
      // Store the persistence preference
      localStorage.setItem("data_persistence_enabled", isPersistent.toString());
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error initializing storage:", error);
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
          <DialogTitle>Data Storage Configuration</DialogTitle>
          <DialogDescription>
            Configure data persistence settings for your domain management
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
              When enabled, your domain data will be stored in the browser's local storage.
            </p>
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="external-db-toggle" className="text-sm font-medium">
                Use external database
              </Label>
              <Switch
                id="external-db-toggle"
                checked={useExternalDb}
                onCheckedChange={setUseExternalDb}
              />
            </div>
            {useExternalDb && (
              <div className="space-y-2">
                <Label htmlFor="connection-string">Connection String</Label>
                <Input 
                  id="connection-string"
                  type="text"
                  placeholder="mongodb://username:password@host:port/database"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your database connection string. For MongoDB, this typically starts with "mongodb://".
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
            {isConnecting ? 'Connecting...' : 'Initialize Storage'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
