
import { CheckCircle } from "lucide-react";

interface InstallationStatusProps {
  isInstalled: boolean;
}

export function InstallationStatus({ isInstalled }: InstallationStatusProps) {
  if (!isInstalled) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span>Database initialized with collections and sample data</span>
    </div>
  );
}
