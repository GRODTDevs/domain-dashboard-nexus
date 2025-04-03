
import { DomainForm } from "@/components/domains/domain-form";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { fetchDomain } from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Domain } from "@/types/domain";

export default function DomainEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadDomain = async () => {
      if (!id) return;
      
      try {
        const data = await fetchDomain(id);
        if (!data) {
          navigate("/domains");
          toast({
            title: "Domain not found",
            description: "The requested domain could not be found.",
            variant: "destructive",
          });
          return;
        }
        setDomain(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load domain details.",
          variant: "destructive",
        });
        navigate("/domains");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDomain();
  }, [id, navigate, toast]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">Loading domain details...</div>
        </div>
      </Layout>
    );
  }
  
  if (!domain) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">Domain not found</h2>
          <p className="text-muted-foreground mt-2">
            The domain you are looking for does not exist.
          </p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit Domain</h1>
        <p className="text-muted-foreground">Update details for {domain.name}</p>
      </div>
      
      <div className="rounded-lg border p-6">
        <DomainForm mode="edit" domain={domain} />
      </div>
    </Layout>
  );
}
