
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, fetchUsers, deleteUser } from "@/lib/api";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { UserDialog } from "./user-dialog";
import { EmptyState } from "@/components/empty-state";
import { UserTable } from "./user-table";
import { UserListHeader } from "./user-list-header";
import { UserListLoading } from "./user-list-loading";
import { Users, Plus } from "lucide-react";

export function UserList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User deleted",
        description: "The user has been successfully removed.",
      });
      setUserToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete the user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsNewUser(false);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsNewUser(true);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  if (isLoading) {
    return <UserListLoading />;
  }
  
  if (users.length === 0) {
    return (
      <div>
        <UserListHeader onAddUser={handleAddNew} />
        
        <EmptyState
          icon={Users}
          title="No users found"
          description="Get started by adding a new user."
          actionLabel="Add User"
          actionIcon={Plus}
          onAction={handleAddNew}
        />
        
        <UserDialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          user={selectedUser}
          isNew={isNewUser}
        />
        
        <ConfirmationDialog
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
        />
      </div>
    );
  }

  return (
    <div>
      <UserListHeader onAddUser={handleAddNew} />
      
      <UserTable 
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <UserDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        user={selectedUser}
        isNew={isNewUser}
      />

      <ConfirmationDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </div>
  );
}
