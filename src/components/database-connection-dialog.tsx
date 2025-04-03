
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { initializeStorage } from "@/lib/db";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { setDatabaseConnectionString, initializeDatabase } from "@/lib/database-config";

interface DatabaseConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatabaseConnectionDialog({ isOpen, onOpenChange }: DatabaseConnectionDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionString, setConnectionString] = useState('');
  const { toast } = useToast();

  // Load existing connection string from env if available
  useEffect(() => {
    if (isOpen && import.meta.env.VITE_MONGODB_URI) {
      setConnectionString('(Using connection string from environment variable)');
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (!connectionString && !import.meta.env.VITE_MONGODB_URI) {
        throw new Error("MongoDB connection string is required");
      }
      
      // If we have a user-provided string and not just using the env var
      if (connectionString && !connectionString.includes('(Using connection string from environment variable)')) {
        if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
          throw new Error("Invalid MongoDB connection string format. Should start with mongodb:// or mongodb+srv://");
        }
        
        // Store the connection string
        setDatabaseConnectionString(connectionString);
      }
      
      // Initialize storage with MongoDB connection
      const initialized = await initializeStorage();
      
      if (!initialized) {
        throw new Error("Failed to initialize MongoDB connection");
      }
      
      toast({
        title: "MongoDB Connection Configured",
        description: "Your MongoDB connection has been successfully configured."
      });
      
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
            Configure your MongoDB connection string
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            disabled={isConnecting || (!connectionString && !import.meta.env.VITE_MONGODB_URI)} 
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
