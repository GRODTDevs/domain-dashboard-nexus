
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initializeDb, isDbConnected } from "@/lib/db";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Default MongoDB connection string
const DEFAULT_MONGO_URI = "mongodb+srv://shauncheeseman:<db_password>@cluster0.if6uc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

interface DatabaseConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatabaseConnectionDialog({ isOpen, onOpenChange }: DatabaseConnectionDialogProps) {
  const [connectionString, setConnectionString] = useState(DEFAULT_MONGO_URI);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Set connection string from localStorage if available when dialog opens
  useEffect(() => {
    if (isOpen) {
      const savedConnection = localStorage.getItem("mongodb_connection_string");
      if (savedConnection) {
        setConnectionString(savedConnection);
      } else {
        setConnectionString(DEFAULT_MONGO_URI);
      }
    }
  }, [isOpen]);

  const handleConnect = async () => {
    if (!connectionString.trim()) {
      toast({
        title: "Error",
        description: "Please enter a MongoDB connection string",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Add a small delay to simulate connection attempt
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const connected = await initializeDb(connectionString);
      if (connected) {
        toast({
          title: "Connected",
          description: "Successfully connected to MongoDB database (simulated in browser)",
        });
        // Store the connection string in localStorage for persistence across page reloads
        localStorage.setItem("mongodb_connection_string", connectionString);
        onOpenChange(false);
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to the MongoDB database. Please check your connection string and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting to database:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to the database",
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
          <DialogTitle>Connect to MongoDB</DialogTitle>
          <DialogDescription>
            Enter your MongoDB connection string to simulate database connectivity
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="connectionString">MongoDB Connection String</Label>
            <Input
              id="connectionString"
              placeholder="mongodb://username:password@host:port/database"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Note: This is a browser environment simulation. In production, you would need a backend service to connect to MongoDB.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={isConnecting} onClick={handleConnect}>
            {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simulate Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
