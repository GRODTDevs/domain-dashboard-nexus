
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
  const [isCheckingDb, setIsCheckingDb] = useState(true);
  
  // Check database status
  useEffect(() => {
    const checkDbStatus = async () => {
      setIsCheckingDb(true);
      try {
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
      } catch (e) {
        console.error("Error checking database status:", e);
        setIsDbReady(false);
      } finally {
        setIsCheckingDb(false);
      }
    };
    
    checkDbStatus();
  }, []);

  // Handle navigation after auth check
  useEffect(() => {
    // Skip navigation if still checking DB status
    if (isCheckingDb) return;
    
    // Once DB check is complete, make navigation decisions
    if (isDbReady === false) {
      // Don't navigate if DB is not ready - we'll show the DB connection UI
      return;
    }
    
    // Only navigate if auth loading is complete
    if (!isLoading) {
      if (isAuthenticated) {
        if (customizeMode) {
          navigate("/settings");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/login");
      }
    }
  }, [navigate, isAuthenticated, customizeMode, isLoading, isDbReady, isCheckingDb]);

  // If still checking DB, show loading
  if (isCheckingDb) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Checking database connection...</div>
      </div>
    );
  }

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

  // Show loading for auth check
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">Loading application...</div>
    </div>
  );
};

export default Index;
