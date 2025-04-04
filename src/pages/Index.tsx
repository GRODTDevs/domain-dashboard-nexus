
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { initializeStorage, isStorageInitialized } from "@/lib/db";
import { EnvDebugDisplay } from "@/components/env-debug-display";
import { WelcomeScreen } from "@/components/welcome-screen";
import { getDatabaseConnectionString } from "@/lib/database-config";
import { LoadingIndicator } from "@/components/loading-indicator";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [databaseConfigured, setDatabaseConfigured] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [initializationStep, setInitializationStep] = useState("Checking configuration...");
  
  console.log("Index: Initial render", { isAuthenticated, isLoading, databaseConfigured, isInitializing });
  
  // Effect to check if database is configured
  useEffect(() => {
    console.log("Index: Checking database configuration");
    const connectionString = getDatabaseConnectionString();
    console.log("Index: Database connection string available:", !!connectionString);
    setDatabaseConfigured(!!connectionString);
  }, []);
  
  // Effect to initialize database
  useEffect(() => {
    const initDb = async () => {
      console.log("Index: Checking if storage is initialized:", isStorageInitialized());
      if (!isStorageInitialized() && databaseConfigured) {
        try {
          setInitializationStep("Establishing database connection...");
          console.log("Index: Attempting to initialize database connection");
          
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Database initialization timed out after 15 seconds")), 15000);
          });
          
          const initPromise = initializeStorage();
          
          // Race between initialization and timeout
          const result = await Promise.race([initPromise, timeoutPromise]);
          console.log("Index: Database initialization result:", result);
          setInitializationStep("Database connected successfully");
        } catch (error) {
          console.error("Index: Failed to initialize database:", error);
          setInitializationError(error instanceof Error ? error.message : "Unknown database error");
          setInitializationStep("Database connection failed");
        }
      } else {
        console.log("Index: Database already initialized or not configured");
      }
      setIsInitializing(false);
    };
    
    console.log("Index: Running database initialization effect");
    initDb();
  }, [databaseConfigured]);
  
  // Navigation effect - only run if database is configured
  useEffect(() => {
    if (!isLoading && !isInitializing) {
      // Only navigate once we're sure about auth state and database is configured
      if (databaseConfigured && !initializationError) {
        console.log("Index: Navigating based on auth state:", isAuthenticated ? "authenticated" : "not authenticated");
        navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
      } else {
        console.log("Index: Database not configured or error occurred, showing welcome screen");
      }
    } else {
      console.log("Index: Still initializing or auth state loading, waiting before navigation");
    }
  }, [isAuthenticated, isLoading, navigate, databaseConfigured, isInitializing, initializationError]);
  
  // Show welcome screen if database is not configured
  if (!databaseConfigured && !isInitializing) {
    return <WelcomeScreen />;
  }
  
  // Show error if database initialization failed
  if (initializationError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-raleway">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Database Connection Error</h1>
          <p className="mb-4">{initializationError}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Please check your MongoDB connection string and make sure your database is accessible.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
          
          {/* Add the environment debug display */}
          <div className="mt-8">
            <EnvDebugDisplay />
          </div>
        </div>
      </div>
    );
  }
  
  // Render loading state with debug display
  return (
    <div className="h-screen flex flex-col items-center justify-center font-raleway">
      <LoadingIndicator step={initializationStep} />
      
      {/* Add the environment debug display */}
      <div className="mt-8">
        <EnvDebugDisplay />
      </div>
    </div>
  );
};

export default Index;
