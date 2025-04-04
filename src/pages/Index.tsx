
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeScreen } from "@/components/welcome-screen";
import { useToast } from "@/hooks/use-toast";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useDatabaseInitialization } from "@/hooks/use-database-initialization";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forceLogin, setForceLogin] = useState(false);
  
  const {
    databaseConfigured,
    isInitializing,
    initializationError,
    initializationStep,
    loadTimeout,
  } = useDatabaseInitialization();
  
  console.log("Index: Initial render", { isAuthenticated, isLoading, databaseConfigured, isInitializing });
  
  // Auto-skip to login after a timeout regardless of database status
  useEffect(() => {
    const autoSkipTimeout = setTimeout(() => {
      if (!forceLogin && isInitializing) {
        console.log("Index: Auto-forcing login after timeout");
        toast({
          title: "Proceeding to Login",
          description: "Database initialization taking too long. Proceeding to login."
        });
        setForceLogin(true);
      }
    }, 6000); // 6 seconds max wait time
    
    return () => clearTimeout(autoSkipTimeout);
  }, [forceLogin, isInitializing, toast]);
  
  // Navigation effect - only run if database is configured
  useEffect(() => {
    if (!isLoading && !isInitializing) {
      // Always proceed to the login page if we choose to force login
      if (forceLogin) {
        console.log("Index: Force login selected, proceeding to login page");
        navigate("/login", { replace: true });
        return;
      }
      
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
  }, [isAuthenticated, isLoading, navigate, databaseConfigured, isInitializing, initializationError, forceLogin]);
  
  // Handle force login to bypass database checks
  const handleForceLogin = () => {
    setForceLogin(true);
  };
  
  // Show welcome screen if database is not configured
  if (!databaseConfigured && !isInitializing) {
    return <WelcomeScreen />;
  }
  
  // Show error if database initialization failed
  if (initializationError || loadTimeout) {
    return (
      <ErrorState 
        error={initializationError} 
        onForceLogin={handleForceLogin}
        loadTimeout={loadTimeout}
      />
    );
  }
  
  // Render loading state with debug display and prominent skip button
  return (
    <LoadingState 
      step={initializationStep}
      onForceLogin={handleForceLogin}
    />
  );
};

export default Index;
