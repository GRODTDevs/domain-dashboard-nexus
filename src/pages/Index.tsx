
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const customizeMode = searchParams.get("customize") === "true";

  // Immediately redirect based on auth status - no delays
  useEffect(() => {
    // Direct navigation without timeouts or conditions
    if (isAuthenticated) {
      console.log("Index: User is authenticated, redirecting to", customizeMode ? "settings" : "dashboard");
      navigate(customizeMode ? "/settings" : "/dashboard", { replace: true });
    } else {
      console.log("Index: User is not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [navigate, isAuthenticated, customizeMode]);

  // Return null instead of a loading screen
  return null;
};

export default Index;
