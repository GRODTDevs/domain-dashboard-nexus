
import { Domain } from "@/types/domain";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "../status-badge";
import { EmptyState } from "../empty-state";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Eye, Plus, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DomainListProps {
  domains: Domain[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function DomainList({ domains, isLoading, onRefresh }: DomainListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse">Loading domains...</div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <EmptyState
        title="No domains found"
        description="Get started by adding your first domain."
        actionLabel="Add Domain"
        actionIcon={Plus}
        onAction={() => navigate("/domains/new")}
        secondaryAction={onRefresh ? {
          label: "Refresh",
          icon: RefreshCw,
          onClick: onRefresh
        } : undefined}
        className="border rounded-md"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domain</TableHead>
          <TableHead>Registrar</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Auto Renew</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.map((domain) => (
          <TableRow key={domain.id} className="cursor-pointer hover:bg-secondary/50" 
            onClick={(e) => {
              e.preventDefault();
              navigate(`/domains/${domain.id}`);
            }}>
            <TableCell className="font-medium">{domain.name}</TableCell>
            <TableCell>{domain.registrar}</TableCell>
            <TableCell>
              <StatusBadge status={domain.status} />
            </TableCell>
            <TableCell>
              {domain.status === "expired" ? (
                <span className="text-danger">Expired</span>
              ) : (
                `${formatDistanceToNow(new Date(domain.expiryDate))} left`
              )}
            </TableCell>
            <TableCell>{domain.autoRenew ? "Yes" : "No"}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/domains/${domain.id}`);
                }}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
