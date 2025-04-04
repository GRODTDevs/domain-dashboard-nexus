
import { useEffect, useState } from "react";
import { EnvDebugDisplay } from "@/components/env-debug-display";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DatabaseConnectionDialog } from "@/components/database-connection-dialog";

interface ErrorStateProps {
  error: string | null;
  onForceLogin: () => void;
  loadTimeout: boolean;
}

export function ErrorState({ error, onForceLogin, loadTimeout }: ErrorStateProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="h-screen flex flex-col items-center justify-center font-raleway">
      <div className="text-center max-w-md p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Database Connection Error</h1>
        <p className="mb-4">{loadTimeout ? "The database connection attempt timed out. This may indicate network issues or incorrect connection details." : error}</p>
        <p className="text-sm text-muted-foreground mb-4">
          Please check your MongoDB connection string and make sure your database is accessible.
        </p>
        
        {/* Make the Skip DB Check button much more prominent */}
        <div className="flex flex-col space-y-2">
          <Button
            onClick={() => {
              toast({
                title: "Proceeding to Login",
                description: "Bypassing database checks and proceeding to login."
              });
              onForceLogin();
            }}
            variant="default"
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 text-lg animate-pulse"
          >
            Skip Database Check & Proceed to Login
          </Button>
          
          <div className="flex space-x-2 mt-2">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Try Again
            </Button>
            
            <Button
              onClick={() => {
                localStorage.removeItem('mongodb_uri');
                localStorage.removeItem('mongodb_installed');
                window.location.reload();
              }}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Clear Connection & Restart
            </Button>
          </div>
          
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="secondary"
            className="mt-2"
          >
            Configure MongoDB Connection
          </Button>
        </div>
        
        {/* Add the environment debug display */}
        <div className="mt-8">
          <EnvDebugDisplay />
        </div>
      </div>
      
      {/* Database connection dialog */}
      <DatabaseConnectionDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
