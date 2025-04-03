
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useNavigate, useParams } from "react-router-dom";
import { deleteDomain, fetchDomain } from "@/lib/api";
import { useEffect, useState } from "react";
import { Domain } from "@/types/domain";
import { CalendarIcon, Edit, Globe, MoreHorizontal, Server, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DomainDetailTabs } from "@/components/domains/domain-detail-tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { SEOAnalysisTool } from "@/components/domains/seo-analysis-tool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function DomainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDomain = async () => {
    if (!id) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDomain();
  }, [id]);

  const handleDeleteDomain = async () => {
    if (!domain) return;

    try {
      setIsDeleting(true);
      const success = await deleteDomain(domain.id);
      
      if (success) {
        toast({
          title: "Success",
          description: `Domain ${domain.name} has been deleted.`,
        });
        // Use replace to prevent going back to a deleted domain
        navigate("/domains", { replace: true });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete domain. Domain not found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete domain due to a server error.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

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
          <Button className="mt-6" onClick={() => navigate("/domains")}>
            Back to Domains
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{domain.name}</h1>
            <StatusBadge status={domain.status} />
          </div>
          <p className="text-muted-foreground">Registered with {domain.registrar}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/domains/${domain.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsConfirmingDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Domain
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Registration Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              {format(new Date(domain.registeredDate), "PP")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiration Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              {format(new Date(domain.expiryDate), "PP")}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <StatusBadge status={domain.status} />
              <Badge variant={domain.autoRenew ? "outline" : "secondary"} className="ml-auto">
                {domain.autoRenew ? "Auto-renew On" : "Auto-renew Off"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {domain.nameservers && domain.nameservers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" /> Nameservers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {domain.nameservers.map((ns, index) => (
                <div key={index} className="px-3 py-2 bg-muted/50 rounded-md text-sm">
                  {ns}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details" className="mb-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4 space-y-6">
          <DomainDetailTabs domain={domain} onUpdate={loadDomain} />
        </TabsContent>
        
        <TabsContent value="seo" className="mt-4">
          <SEOAnalysisTool domainId={domain.id} domainName={domain.name} />
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={handleDeleteDomain}
        title={`Delete ${domain.name}`}
        description="Are you sure you want to delete this domain? This action cannot be undone and all associated data will be permanently removed."
        confirmLabel="Delete Domain"
        variant="destructive"
      />
    </Layout>
  );
}
