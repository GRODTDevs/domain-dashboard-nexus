
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const customizeMode = searchParams.get("customize") === "true";

  // Handle navigation after auth check - simplified logic
  useEffect(() => {
    // Don't wait for anything else, just check auth status
    console.log("Index: Auth state", { isAuthenticated, isLoading });
    
    // Small timeout to ensure auth check has time to initialize
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        console.log("Index: User is authenticated, redirecting to", customizeMode ? "settings" : "dashboard");
        navigate(customizeMode ? "/settings" : "/dashboard");
      } else {
        console.log("Index: User is not authenticated, redirecting to login");
        navigate("/login");
      }
    }, 100); // Very short timeout
    
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, customizeMode, isLoading]);

  // Simple loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );
};

export default Index;
