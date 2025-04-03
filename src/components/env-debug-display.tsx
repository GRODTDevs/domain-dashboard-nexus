
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function EnvDebugDisplay() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [showEnv, setShowEnv] = useState(false);

  useEffect(() => {
    // Get all Vite env variables
    const viteEnvVars: Record<string, string> = {};
    
    // Safely collect all env variables
    try {
      Object.keys(import.meta.env).forEach(key => {
        viteEnvVars[key] = import.meta.env[key];
      });
    } catch (error) {
      console.error("Error collecting env variables:", error);
    }
    
    setEnvVars(viteEnvVars);
  }, []);

  return (
    <div className="mx-auto px-6 py-4">
      <Button 
        onClick={() => setShowEnv(!showEnv)}
        variant="outline"
        className="mb-2"
      >
        {showEnv ? "Hide" : "Show"} Environment Variables
      </Button>
      
      {showEnv && (
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              Debug information about available environment variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">Vite Environment Variables:</div>
              <pre className="bg-muted p-2 rounded-md overflow-auto text-xs">
                {Object.keys(envVars).length > 0 ? (
                  Object.entries(envVars).map(([key, value]) => {
                    // Mask sensitive values
                    const displayValue = key.includes('MONGODB_URI') || key.includes('SECRET') || key.includes('KEY')
                      ? (value ? value.substring(0, 10) + '...' : 'undefined')
                      : value;
                    
                    return (
                      <div key={key}>
                        <code>{key}: {displayValue}</code>
                      </div>
                    );
                  })
                ) : (
                  <code>No environment variables found</code>
                )}
              </pre>
              
              <Separator className="my-4" />
              
              <div className="font-medium">Database Connection Status:</div>
              <div>
                <code>VITE_MONGODB_URI: {import.meta.env.VITE_MONGODB_URI ? 'Set' : 'Not Set'}</code>
              </div>
              
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    alert(`API health status: ${JSON.stringify(data)}`);
                  } catch (error) {
                    alert(`API error: ${error instanceof Error ? error.message : String(error)}`);
                  }
                }}
                variant="outline"
                size="sm"
              >
                Test API Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
