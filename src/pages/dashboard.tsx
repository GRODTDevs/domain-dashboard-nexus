
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout";
import { fetchDomains } from "@/lib/api";
import { DomainStatus } from "@/types/domain";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Globe, PlusCircle } from "lucide-react";

export default function Dashboard() {
  const [domains, setDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadDomains = async () => {
      try {
        const data = await fetchDomains();
        setDomains(data);
      } catch (error) {
        console.error("Failed to fetch domains:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDomains();
  }, []);
  
  const totalDomains = domains.length;
  const expiringDomains = domains.filter(d => d.status === 'expiring-soon').length;
  const expiredDomains = domains.filter(d => d.status === 'expired').length;
  
  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Domain Dashboard</h1>
        <Button asChild>
          <Link to="/domains/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Domain
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{isLoading ? "..." : totalDomains}</div>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">All registered domains</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{isLoading ? "..." : expiringDomains}</div>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Domains expiring within 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{isLoading ? "..." : expiredDomains}</div>
              <AlertTriangle className="h-4 w-4 text-danger" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Domains that have expired</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest domain management activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-6 text-center text-muted-foreground">Loading activity...</div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
