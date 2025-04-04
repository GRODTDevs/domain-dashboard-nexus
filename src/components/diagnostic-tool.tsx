
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function DiagnosticTool() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [dbStatus, setDbStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [dbError, setDbError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  // Check server connectivity
  useEffect(() => {
    const checkServer = async () => {
      try {
        addLog("Checking API server connection...");
        const response = await fetch('/api/health', { 
          signal: AbortSignal.timeout(3000) // 3s timeout 
        });
        
        if (response.ok) {
          const data = await response.json();
          setServerStatus('online');
          addLog(`Server connection successful: ${JSON.stringify(data)}`);
        } else {
          setServerStatus('offline');
          addLog(`Server connection failed with status: ${response.status}`);
        }
      } catch (error) {
        setServerStatus('offline');
        addLog(`Server connection error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    checkServer();
  }, []);

  // Check database connection if server is online
  useEffect(() => {
    if (serverStatus === 'online') {
      const checkDatabase = async () => {
        try {
          addLog("Checking database connectivity...");
          const response = await fetch('/api/db/status', { 
            signal: AbortSignal.timeout(5000) // 5s timeout
          });
          
          if (response.ok) {
            const data = await response.json();
            setDbStatus(data.connected ? 'connected' : 'error');
            if (!data.connected && data.message) {
              setDbError(data.message);
              addLog(`Database connection error: ${data.message}`);
            } else {
              addLog(`Database status: ${data.connected ? 'Connected' : 'Disconnected'}`);
            }
          } else {
            setDbStatus('error');
            const data = await response.json().catch(() => ({ message: `HTTP Status ${response.status}` }));
            setDbError(data.message || `Failed with status ${response.status}`);
            addLog(`Database status check failed: ${data.message || response.status}`);
          }
        } catch (error) {
          setDbStatus('error');
          setDbError(error instanceof Error ? error.message : String(error));
          addLog(`Database status check error: ${error instanceof Error ? error.message : String(error)}`);
        }
      };

      checkDatabase();
    }
  }, [serverStatus]);

  // Check environment variables
  useEffect(() => {
    const viteEnvVars: Record<string, string> = {};
    
    try {
      Object.keys(import.meta.env).forEach(key => {
        viteEnvVars[key] = import.meta.env[key];
      });
      setEnvVars(viteEnvVars);
      
      const mongoUri = import.meta.env.VITE_MONGODB_URI;
      addLog(`MongoDB URI available in environment: ${!!mongoUri}`);
      if (mongoUri) {
        addLog(`MongoDB URI starts with: ${mongoUri.substring(0, 10)}...`);
      }
    } catch (error) {
      addLog(`Error reading environment variables: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  // Add log entry
  const addLog = (message: string) => {
    setDiagnosticLogs(prev => [
      ...prev, 
      `[${new Date().toISOString()}] ${message}`
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button 
          variant="outline" 
          className="bg-background/80 backdrop-blur-sm border-muted"
          onClick={() => setIsExpanded(true)}
        >
          Show Diagnostics
        </Button>
      ) : (
        <Card className="w-96 shadow-lg border-muted bg-background/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">System Diagnostics</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(false)}
              >
                Close
              </Button>
            </div>
            <CardDescription>Troubleshooting information</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Server Status */}
            <div className="flex items-center justify-between">
              <span className="font-medium">API Server:</span>
              {serverStatus === 'online' && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" /> Online
                </Badge>
              )}
              {serverStatus === 'offline' && (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                  <XCircle className="h-3 w-3 mr-1" /> Offline
                </Badge>
              )}
              {serverStatus === 'unknown' && (
                <Badge variant="outline">Checking...</Badge>
              )}
            </div>
            
            {/* Database Status */}
            <div className="flex items-center justify-between">
              <span className="font-medium">MongoDB Connection:</span>
              {dbStatus === 'connected' && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" /> Connected
                </Badge>
              )}
              {dbStatus === 'error' && (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                  <XCircle className="h-3 w-3 mr-1" /> Error
                </Badge>
              )}
              {dbStatus === 'unknown' && (
                <Badge variant="outline">Checking...</Badge>
              )}
            </div>
            
            {/* Database Error */}
            {dbError && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Database Error</AlertTitle>
                <AlertDescription className="text-xs">{dbError}</AlertDescription>
              </Alert>
            )}
            
            <Separator />
            
            {/* Environment */}
            <div>
              <h4 className="text-sm font-medium mb-1">MongoDB URI:</h4>
              <p className="text-xs bg-muted p-1 rounded">
                {import.meta.env.VITE_MONGODB_URI ? 
                  `${import.meta.env.VITE_MONGODB_URI.substring(0, 15)}...` : 
                  "Not configured"}
              </p>
            </div>
            
            <Separator />
            
            {/* Logs */}
            <div>
              <h4 className="text-sm font-medium mb-1">Diagnostic Logs:</h4>
              <div className="bg-muted p-2 rounded h-32 overflow-y-auto text-xs">
                {diagnosticLogs.map((log, i) => (
                  <div key={i} className="pb-1">{log}</div>
                ))}
                {diagnosticLogs.length === 0 && (
                  <div className="text-muted-foreground italic">No logs collected</div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={async () => {
                  addLog("Manual server health check...");
                  try {
                    const response = await fetch('/api/health');
                    if (response.ok) {
                      const data = await response.json();
                      addLog(`Health check success: ${JSON.stringify(data)}`);
                    } else {
                      addLog(`Health check failed: ${response.status}`);
                    }
                  } catch (error) {
                    addLog(`Health check error: ${error instanceof Error ? error.message : String(error)}`);
                  }
                }}
              >
                Check Server
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={async () => {
                  addLog("Manual DB status check...");
                  try {
                    const response = await fetch('/api/db/status');
                    if (response.ok) {
                      const data = await response.json();
                      addLog(`DB status: ${JSON.stringify(data)}`);
                    } else {
                      addLog(`DB status check failed: ${response.status}`);
                    }
                  } catch (error) {
                    addLog(`DB status error: ${error instanceof Error ? error.message : String(error)}`);
                  }
                }}
              >
                Check DB
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  window.location.reload();
                  addLog("Reloading page...");
                }}
              >
                Reload App
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
