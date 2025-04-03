import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/dashboard";
import DomainsListPage from "./pages/domains-list";
import DomainDetailPage from "./pages/domain-detail";
import DomainNewPage from "./pages/domain-new";
import DomainEditPage from "./pages/domain-edit";
import SettingsPage from "./pages/settings";
import UsersPage from "./pages/users";
import { useState, useEffect } from "react";
import { DatabaseConnectionButton } from "./components/database-connection-button";
import { isDbConnected } from "./lib/db";
import { isDatabaseConfigured } from "./lib/database-config";

const App = () => {
  // Create a new QueryClient instance
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
  
  // Add state to track app initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDbWarning, setShowDbWarning] = useState(false);
  
  useEffect(() => {
    // Simulate any initialization tasks
    const initApp = async () => {
      try {
        // Only show warning if there's no connection string configured
        const isConfigured = isDatabaseConfigured();
        setShowDbWarning(!isConfigured);
        
        // Always mark as initialized to show the app
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsInitialized(true); // Still set to true so the app renders
      }
    };
    
    initApp();
  }, []);
  
  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading application...</div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {showDbWarning && (
            <div className="fixed top-0 left-0 right-0 bg-amber-100 dark:bg-amber-900 p-2 z-50 flex justify-center">
              <div className="flex items-center gap-2">
                <span className="text-amber-800 dark:text-amber-200">
                  MongoDB connection not configured
                </span>
                <DatabaseConnectionButton />
              </div>
            </div>
          )}
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Index />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/domains" element={
                <ProtectedRoute>
                  <DomainsListPage />
                </ProtectedRoute>
              } />
              <Route path="/domains/:id" element={
                <ProtectedRoute>
                  <DomainDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/domains/new" element={
                <ProtectedRoute>
                  <DomainNewPage />
                </ProtectedRoute>
              } />
              <Route path="/domains/:id/edit" element={
                <ProtectedRoute>
                  <DomainEditPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
