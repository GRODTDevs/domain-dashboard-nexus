
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { initializeStorage } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/database-config";
import { DatabaseConnectionButton } from "@/components/database-connection-button";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const customizeMode = searchParams.get("customize") === "true";
  const [isDbReady, setIsDbReady] = useState<boolean | null>(null);
  
  // Check database status
  useEffect(() => {
    const checkDbStatus = async () => {
      // Check if we have a connection string configured
      if (isDatabaseConfigured()) {
        try {
          await initializeStorage();
          setIsDbReady(true);
        } catch (error) {
          console.error("Failed to initialize database:", error);
          setIsDbReady(false);
        }
      } else {
        setIsDbReady(false);
      }
    };
    
    checkDbStatus();
  }, []);

  // Handle navigation after auth check
  useEffect(() => {
    // Skip navigation until we know auth status and db status
    if (isLoading || isDbReady === null) return;
    
    // If DB is not configured, show the connection dialog
    if (!isDbReady) {
      // Don't redirect - we'll show the DB connection UI
      return;
    }
    
    // Handle auth-based navigation
    if (isAuthenticated) {
      if (customizeMode) {
        // Redirect to settings if in customize mode
        navigate("/settings");
      } else {
        // Redirect to dashboard if already authenticated
        navigate("/dashboard");
      }
    } else {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [navigate, isAuthenticated, customizeMode, isLoading, isDbReady]);

  // If the database is not ready, show the connection button
  if (isDbReady === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to Domain Dashboard Nexus</h1>
        <p className="text-center mb-6">Please configure your MongoDB connection to get started.</p>
        <DatabaseConnectionButton />
      </div>
    );
  }

  // Loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
};

export default Index;
