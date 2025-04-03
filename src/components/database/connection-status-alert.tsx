
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConnectionStatusAlertProps {
  envVariablePresent: boolean;
}

export function ConnectionStatusAlert({ envVariablePresent }: ConnectionStatusAlertProps) {
  return (
    <Alert variant={envVariablePresent ? "default" : "destructive"}>
      <Info className="h-4 w-4" />
      <AlertDescription>
        {envVariablePresent 
          ? "Using MongoDB connection string from environment variable."
          : "No VITE_MONGODB_URI environment variable found."}
      </AlertDescription>
    </Alert>
  );
}
