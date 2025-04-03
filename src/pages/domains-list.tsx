
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Database } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { fetchDomains } from "@/lib/api";
import { useEffect, useState } from "react";
import { Domain } from "@/types/domain";
import { DomainList } from "@/components/domains/domain-list";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DatabaseConnectionDialog } from "@/components/database-connection-dialog";
import { initializeStorage, isStorageInitialized } from "@/lib/db";

export default function DomainsListPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbDialogOpen, setDbDialogOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  // Auto-initialize storage on component mount
  useEffect(() => {
    const autoInitializeStorage = async () => {
      if (!isStorageInitialized()) {
        try {
          const initialized = await initializeStorage(); 
          if (initialized) {
            console.log("Auto-initialized local storage");
            toast({
              title: "Storage Initialized",
              description: "Successfully configured local storage for data persistence",
            });
          }
        } catch (error) {
          console.error("Failed to auto-initialize storage:", error);
        }
      }
    };
    
    autoInitializeStorage();
  }, [toast]);

  const loadDomains = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDomains();
      console.log(`Loaded ${data.length} domains`);
      setDomains(data);
      setFilteredDomains(data);
    } catch (error) {
      console.error("Failed to fetch domains:", error);
      toast({
        title: "Error",
        description: "Failed to load domains. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load domains on initial mount and also when returning from another route
  useEffect(() => {
    loadDomains();
  }, [location.key]); // This will re-run when the location key changes (navigation happens)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDomains(domains);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = domains.filter(
      (domain) =>
        domain.name.toLowerCase().includes(query) ||
        domain.registrar.toLowerCase().includes(query)
    );

    setFilteredDomains(filtered);
  }, [searchQuery, domains]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">All Domains</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDbDialogOpen(true)}>
            <Database className="mr-2 h-4 w-4" />
            {isStorageInitialized() ? "Storage Configured" : "Configure Storage"}
          </Button>
          <Button asChild>
            <Link to="/domains/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Domain
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search domains..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <DomainList 
          domains={filteredDomains} 
          isLoading={isLoading}
          onRefresh={loadDomains}
        />
      </div>
      
      <DatabaseConnectionDialog 
        isOpen={dbDialogOpen}
        onOpenChange={setDbDialogOpen}
      />
    </Layout>
  );
}
