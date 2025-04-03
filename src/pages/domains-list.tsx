
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchDomains } from "@/lib/api";
import { useEffect, useState } from "react";
import { Domain } from "@/types/domain";
import { DomainList } from "@/components/domains/domain-list";
import { Input } from "@/components/ui/input";

export default function DomainsListPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadDomains = async () => {
      try {
        const data = await fetchDomains();
        setDomains(data);
        setFilteredDomains(data);
      } catch (error) {
        console.error("Failed to fetch domains:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDomains();
  }, []);

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
        <Button asChild>
          <Link to="/domains/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Domain
          </Link>
        </Button>
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
        <DomainList domains={filteredDomains} isLoading={isLoading} />
      </div>
    </Layout>
  );
}
