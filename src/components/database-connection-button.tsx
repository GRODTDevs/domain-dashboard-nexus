
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DatabaseConnectionDialog } from "@/components/database-connection-dialog";
import { isDbConnected } from "@/lib/db";
import { Database } from "lucide-react";

export function DatabaseConnectionButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <Database className="h-4 w-4" />
        <span>{isDbConnected() ? "Database Connected" : "Configure Database"}</span>
      </Button>
      <DatabaseConnectionDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
}
