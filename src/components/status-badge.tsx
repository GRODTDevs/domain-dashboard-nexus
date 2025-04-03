
import { cn } from "@/lib/utils";
import { DomainStatus } from "@/types/domain";

interface StatusBadgeProps {
  status: DomainStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    'active': {
      bg: 'bg-success/20',
      text: 'text-success',
      label: 'Active'
    },
    'expiring-soon': {
      bg: 'bg-warning/20',
      text: 'text-warning',
      label: 'Expiring Soon'
    },
    'expired': {
      bg: 'bg-danger/20',
      text: 'text-danger',
      label: 'Expired'
    },
    'inactive': {
      bg: 'bg-muted/20',
      text: 'text-muted-foreground',
      label: 'Inactive'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.bg, 
      config.text,
      className
    )}>
      {config.label}
    </span>
  );
}
