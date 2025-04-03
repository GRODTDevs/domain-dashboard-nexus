
import { Layout } from "@/components/layout";
import { UserList } from "@/components/users/user-list";

export default function UsersPage() {
  return (
    <Layout>
      <div className="container py-6 space-y-8">
        <div className="flex-1 space-y-4">
          <UserList />
        </div>
      </div>
    </Layout>
  );
}
