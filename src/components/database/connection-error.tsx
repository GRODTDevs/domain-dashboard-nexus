
import { AlertCircle } from "lucide-react";

interface ConnectionErrorProps {
  error: string | null;
}

export function ConnectionError({ error }: ConnectionErrorProps) {
  if (!error) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span>{error}</span>
    </div>
  );
}
