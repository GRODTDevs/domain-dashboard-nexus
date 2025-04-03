
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { isDatabaseInstalled as configIsDatabaseInstalled } from "@/lib/database-config";
import { ConnectionStatusAlert } from "@/components/database/connection-status-alert";
import { ConnectionStringInput } from "@/components/database/connection-string-input";
import { ConnectionError } from "@/components/database/connection-error";
import { InstallationStatus } from "@/components/database/installation-status";
import { useDatabaseConnection } from "@/hooks/use-database-connection";

interface DatabaseConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatabaseConnectionDialog({ isOpen, onOpenChange }: DatabaseConnectionDialogProps) {
  const [connectionString, setConnectionString] = useState('');
  const [installStatus, setInstallStatus] = useState(configIsDatabaseInstalled());
  const [envVariablePresent, setEnvVariablePresent] = useState(false);
  const { isConnecting, connectionError, connect, setConnectionError } = useDatabaseConnection();

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
  }, [isOpen, setConnectionError]);

  const handleConnect = async () => {
    const success = await connect(connectionString);
    if (success) {
      window.location.reload();
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
          <ConnectionStatusAlert envVariablePresent={envVariablePresent} />
          
          <ConnectionStringInput 
            connectionString={connectionString}
            onChange={setConnectionString}
            disabled={!!import.meta.env.VITE_MONGODB_URI}
          />
          
          <ConnectionError error={connectionError} />
          
          <InstallationStatus isInstalled={installStatus} />
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
