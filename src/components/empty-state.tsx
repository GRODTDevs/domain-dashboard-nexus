
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = PlusCircle,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon = PlusCircle,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="rounded-full bg-muted p-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={onAction}
        >
          <ActionIcon className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
