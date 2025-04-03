
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to dashboard if already authenticated
      navigate("/dashboard");
    } else {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [navigate, isAuthenticated]);

  return null;
};

export default Index;
