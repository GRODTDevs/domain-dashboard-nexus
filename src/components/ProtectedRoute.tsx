
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<Error | null>(null);

  // Add error boundary functionality
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught in ProtectedRoute:", event.error);
      setError(event.error || new Error("Unknown error occurred"));
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-destructive mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">
          An error occurred while loading this page. You might need to log in again.
        </p>
        <div className="bg-muted p-4 rounded-md w-full max-w-md overflow-auto">
          <pre className="text-xs">{error.message}</pre>
        </div>
        <button 
          onClick={() => window.location.href = "/login"}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Return to login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
