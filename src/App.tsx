
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/dashboard";
import DomainsListPage from "./pages/domains-list";
import DomainDetailPage from "./pages/domain-detail";
import DomainNewPage from "./pages/domain-new";
import DomainEditPage from "./pages/domain-edit";
import SettingsPage from "./pages/settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/domains" element={<DomainsListPage />} />
          <Route path="/domains/:id" element={<DomainDetailPage />} />
          <Route path="/domains/new" element={<DomainNewPage />} />
          <Route path="/domains/:id/edit" element={<DomainEditPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
