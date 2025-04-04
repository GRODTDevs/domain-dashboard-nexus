
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { initializeStorage, isStorageInitialized } from "@/lib/db";
import { EnvDebugDisplay } from "@/components/env-debug-display";
import { WelcomeScreen } from "@/components/welcome-screen";
import { getDatabaseConnectionString } from "@/lib/database-config";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [databaseConfigured, setDatabaseConfigured] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Effect to check if database is configured
  useEffect(() => {
    const connectionString = getDatabaseConnectionString();
    setDatabaseConfigured(!!connectionString);
  }, []);
  
  // Effect to initialize database
  useEffect(() => {
    const initDb = async () => {
      console.log("Index: Checking if storage is initialized:", isStorageInitialized());
      if (!isStorageInitialized() && databaseConfigured) {
        try {
          console.log("Index: Attempting to initialize database connection");
          const result = await initializeStorage();
          console.log("Index: Database initialization result:", result);
        } catch (error) {
          console.error("Index: Failed to initialize database:", error);
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
    if (!isLoading && !isInitializing && databaseConfigured) {
      // Only navigate once we're sure about auth state and database is configured
      console.log("Index: Navigating based on auth state:", isAuthenticated ? "authenticated" : "not authenticated");
      navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
    } else if (!isLoading && !isInitializing) {
      console.log("Index: Database not configured, showing welcome screen");
    } else {
      console.log("Index: Still initializing or auth state loading, waiting before navigation");
    }
  }, [isAuthenticated, isLoading, navigate, databaseConfigured, isInitializing]);
  
  // Show welcome screen if database is not configured
  if (!databaseConfigured && !isInitializing) {
    return <WelcomeScreen />;
  }
  
  // Render loading state with debug display
  return (
    <div className="h-screen flex flex-col items-center justify-center font-raleway">
      <p className="text-lg mb-4">Loading application...</p>
      
      {/* Add the environment debug display */}
      <EnvDebugDisplay />
    </div>
  );
};

export default Index;
