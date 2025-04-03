
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
  secondaryAction?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = PlusCircle,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon = PlusCircle,
  onAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="rounded-full bg-muted p-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center gap-2">
        {actionLabel && onAction && (
          <Button
            variant="outline"
            onClick={onAction}
          >
            <ActionIcon className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}
        {secondaryAction && (
          <Button
            variant="ghost"
            onClick={secondaryAction.onClick}
          >
            <secondaryAction.icon className="mr-2 h-4 w-4" />
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
