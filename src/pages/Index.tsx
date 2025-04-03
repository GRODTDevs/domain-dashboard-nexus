
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const customizeMode = searchParams.get("customize") === "true";

  // Handle navigation after auth check
  useEffect(() => {
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
  }, [navigate, isAuthenticated, customizeMode, isLoading]);

  // Show loading for auth check
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading application...</div>
    </div>
  );
};

export default Index;
