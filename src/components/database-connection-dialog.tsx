
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { initializeStorage, isStorageInitialized } from "@/lib/db";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface DatabaseConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatabaseConnectionDialog({ isOpen, onOpenChange }: DatabaseConnectionDialogProps) {
  const [isPersistent, setIsPersistent] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Add a small delay to simulate initialization
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const initialized = await initializeStorage();
      if (initialized) {
        toast({
          title: "Storage Initialized",
          description: "Successfully configured local storage for data persistence",
        });
        
        // Store the persistence preference
        localStorage.setItem("data_persistence_enabled", isPersistent.toString());
        onOpenChange(false);
      } else {
        toast({
          title: "Initialization Failed",
          description: "Could not initialize local storage. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error initializing storage:", error);
      toast({
        title: "Storage Error",
        description: "An error occurred while initializing local storage",
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
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={isConnecting} onClick={handleConnect}>
            {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Initialize Storage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
