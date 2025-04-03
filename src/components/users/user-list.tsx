import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Users } from "lucide-react";
import { User, fetchUsers, deleteUser } from "@/lib/api";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { UserDialog } from "./user-dialog";
import { EmptyState } from "@/components/empty-state";

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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">Loading users...</div>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Users</h2>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
        
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.active ? "success" : "secondary"}>
                    {user.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
