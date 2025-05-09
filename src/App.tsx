
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DiagnosticTool } from "./components/diagnostic-tool";
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

const App = () => {
  // Create a new QueryClient instance with debugging
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <DiagnosticTool />
            <Routes>
              {/* Home route - redirects based on auth status */}
              <Route path="/" element={<Index />} />
              
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              
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
              <Route path="/domains/new" element={
                <ProtectedRoute>
                  <DomainNewPage />
                </ProtectedRoute>
              } />
              <Route path="/domains/:id" element={
                <ProtectedRoute>
                  <DomainDetailPage />
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
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </HashRouter>
    </QueryClientProvider>
  );
};

export default App;
