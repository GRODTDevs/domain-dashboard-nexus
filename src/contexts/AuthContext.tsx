
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users - in a real app, this would come from a database
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    password: "admin123", // In a real app, NEVER store passwords in plain text
    role: "admin" as const,
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Regular User",
    password: "user123",
    role: "user" as const,
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check for existing session once on mount
  useEffect(() => {
    const checkAuth = () => {
      console.log("Checking authentication status...");
      try {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
          console.log("Found stored user");
          setUser(JSON.parse(storedUser));
        } else {
          console.log("No stored user found");
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        // Clear invalid storage
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      } finally {
        // Always set isLoading to false and initialized to true when done
        setIsLoading(false);
        setInitialized(true);
        console.log("Authentication check completed");
      }
    };
    
    // Small delay to ensure DOM is fully loaded
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async ({ email, password, rememberMe = false }: { email: string; password: string; rememberMe?: boolean }): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log("Login attempt for:", email);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        console.log("Login successful for:", email);
        
        // Store user in localStorage if rememberMe is true or remove if false
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(userWithoutPassword));
          sessionStorage.removeItem("user");
        } else {
          // For non-remembered sessions, we'll use sessionStorage instead
          sessionStorage.setItem("user", JSON.stringify(userWithoutPassword));
          localStorage.removeItem("user");
        }
        return true;
      }
      console.log("Login failed: Invalid credentials");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out user");
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  };

  // Only render children once we've checked auth status
  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        Initializing application...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
