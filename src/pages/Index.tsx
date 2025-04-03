
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const customizeMode = searchParams.get("customize") === "true";

  useEffect(() => {
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
  }, [navigate, isAuthenticated, customizeMode]);

  return null;
};

export default Index;
