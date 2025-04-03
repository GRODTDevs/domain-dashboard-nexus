
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConnectionStringInputProps {
  connectionString: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function ConnectionStringInput({ 
  connectionString, 
  onChange, 
  disabled 
}: ConnectionStringInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="connection-string">MongoDB Connection String</Label>
      <Input 
        id="connection-string"
        type="text"
        placeholder={import.meta.env.VITE_MONGODB_URI ? 
          "(Using connection string from environment variable)" : 
          "mongodb://username:password@host:port/database"}
        value={connectionString}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
        disabled={disabled}
      />
      {import.meta.env.VITE_MONGODB_URI ? (
        <p className="text-xs text-muted-foreground">
          Using MongoDB connection string from environment variable. To override, remove the VITE_MONGODB_URI environment variable.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Enter your MongoDB connection string to connect to your database. 
          Alternatively, you can set the VITE_MONGODB_URI environment variable.
        </p>
      )}
    </div>
  );
}
