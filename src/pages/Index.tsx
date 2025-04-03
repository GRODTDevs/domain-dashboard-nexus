
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { initializeStorage, isStorageInitialized } from "@/lib/db";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Effect to initialize database
  useEffect(() => {
    const initDb = async () => {
      if (!isStorageInitialized()) {
        try {
          console.log("Index: Attempting to initialize database connection");
          await initializeStorage();
        } catch (error) {
          console.error("Failed to initialize database:", error);
        }
      }
    };
    
    initDb();
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
      // Only navigate once we're sure about auth state
      console.log("Index: Navigating based on auth state:", isAuthenticated ? "authenticated" : "not authenticated");
      navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Always render a loading state - navigation will happen via effect
  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-lg">Loading application...</p>
    </div>
  );
};

export default Index;
