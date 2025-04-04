
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UserListHeaderProps {
  onAddUser: () => void;
}

export function UserListHeader({ onAddUser }: UserListHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Users</h2>
      <Button onClick={onAddUser}>
        <Plus className="h-4 w-4 mr-2" />
        Add User
      </Button>
    </div>
  );
}
