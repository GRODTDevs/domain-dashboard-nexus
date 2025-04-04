
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { isDbConnected } from "@/lib/db";
import { Database } from "lucide-react";

export function DatabaseConnectionButton() {
  const [isConnected] = useState(isDbConnected());

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      disabled
    >
      <Database className="h-4 w-4" />
      <span>{isConnected ? "SQLite Connected" : "Connecting to SQLite..."}</span>
    </Button>
  );
}
