
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isDatabaseConfigured } from "@/lib/database-config";
import { DatabaseConnectionButton } from "@/components/database-connection-button";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const customizeMode = searchParams.get("customize") === "true";
  const [isDbReady, setIsDbReady] = useState<boolean | null>(null);
  const [dbCheckTimeout, setDbCheckTimeout] = useState(false);

  // Check database status with timeout
  useEffect(() => {
    // Set a timeout to prevent being stuck in loading
    const timeoutId = setTimeout(() => {
      setDbCheckTimeout(true);
    }, 3000); // 3 second timeout

    // Check if DB is configured
    const checkDbStatus = async () => {
      try {
        // Simple check - just see if the connection string exists
        const isConfigured = isDatabaseConfigured();
        setIsDbReady(isConfigured);
      } catch (e) {
        console.error("Error checking database status:", e);
        setIsDbReady(false);
      }
    };
    
    checkDbStatus();
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle navigation after auth check
  useEffect(() => {
    // If we've timed out or completed DB check, proceed with navigation
    if (dbCheckTimeout || isDbReady !== null) {
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
    }
  }, [navigate, isAuthenticated, customizeMode, isLoading, isDbReady, dbCheckTimeout]);

  // If database is not configured, show connection button
  if (isDbReady === false || dbCheckTimeout) {
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
