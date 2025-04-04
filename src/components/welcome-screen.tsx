
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { DatabaseConnectionDialog } from "@/components/database-connection-dialog";
import { ArrowRight, Database } from "lucide-react";

export function WelcomeScreen() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">Getting Started</h3>
            <p className="mb-2">To use this application, you need to configure a MongoDB database connection.</p>
            <p>You can use MongoDB Atlas for a free cloud-hosted database.</p>
          </div>
          
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
    </div>
  );
}
