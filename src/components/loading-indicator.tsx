
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  step: string;
}

export function LoadingIndicator({ step }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
      <p className="text-lg">{step}</p>
      <p className="text-sm text-muted-foreground">
        This may take a moment...
      </p>
    </div>
  );
}
