
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { DatabaseConnectionDialog } from "@/components/database-connection-dialog";
import { ArrowRight, Database, AlertTriangle } from "lucide-react";

export function WelcomeScreen() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isErrorMode, setIsErrorMode] = useState(false);
  
  // Check if we have a stored error state from a previous attempt
  useState(() => {
    const hasError = localStorage.getItem('mongodb_connection_error');
    if (hasError) {
      setIsErrorMode(true);
    }
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="max-w-2xl w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-raleway">Welcome to Domain Dashboard Nexus</CardTitle>
          <CardDescription>
            Manage your domains, track expirations, and analyze SEO performance all in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isErrorMode ? (
            <div className="bg-destructive/10 p-4 rounded-md border border-destructive">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-medium text-destructive">Previous Connection Failed</h3>
              </div>
              <p className="mb-2">There was an issue connecting to MongoDB on your previous attempt.</p>
              <p className="text-sm">
                Please check your MongoDB connection string and make sure your database is accessible.
                If you're using MongoDB Atlas, check that your IP address is whitelisted.
              </p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem('mongodb_connection_error');
                    localStorage.removeItem('mongodb_uri');
                    localStorage.removeItem('mongodb_installed');
                    setIsErrorMode(false);
                  }}
                >
                  Reset Connection Settings
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Getting Started</h3>
              <p className="mb-2">To use this application, you need to configure a MongoDB database connection.</p>
              <p>You can use MongoDB Atlas for a free cloud-hosted database.</p>
            </div>
          )}
          
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Database className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">Configure your database connection to begin</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full font-raleway" 
            onClick={() => setIsDialogOpen(true)}
          >
            Configure Database
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      
      <DatabaseConnectionDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      
      <div className="mt-8 text-sm text-muted-foreground">
        Need help? Check out the documentation for setup instructions.
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground/70">
        <p>If the application is not responding, please try:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Checking your MongoDB connection string</li>
          <li>Ensuring your MongoDB instance is running</li>
          <li>Verifying that your IP is whitelisted in MongoDB Atlas</li>
        </ul>
      </div>
    </div>
  );
}
