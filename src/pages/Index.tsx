
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { initializeStorage, isStorageInitialized } from "@/lib/db";
import { EnvDebugDisplay } from "@/components/env-debug-display";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Effect to initialize database
  useEffect(() => {
    const initDb = async () => {
      console.log("Index: Checking if storage is initialized:", isStorageInitialized());
      if (!isStorageInitialized()) {
        try {
          console.log("Index: Attempting to initialize database connection");
          const result = await initializeStorage();
          console.log("Index: Database initialization result:", result);
        } catch (error) {
          console.error("Index: Failed to initialize database:", error);
        }
      } else {
        console.log("Index: Database already initialized");
      }
    };
    
    console.log("Index: Running database initialization effect");
    initDb();
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
      // Only navigate once we're sure about auth state
      console.log("Index: Navigating based on auth state:", isAuthenticated ? "authenticated" : "not authenticated");
      navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
    } else {
      console.log("Index: Auth state still loading, waiting before navigation");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Render loading state with debug display
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <p className="text-lg mb-4">Loading application...</p>
      
      {/* Add the environment debug display */}
      <EnvDebugDisplay />
    </div>
  );
};

export default Index;
