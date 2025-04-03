
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
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
