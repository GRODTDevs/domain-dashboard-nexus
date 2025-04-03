
import { DomainForm } from "@/components/domains/domain-form";
import { Layout } from "@/components/layout";

export default function DomainNewPage() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add New Domain</h1>
        <p className="text-muted-foreground">Register a new domain to track</p>
      </div>
      
      <div className="rounded-lg border p-6">
        <DomainForm mode="create" />
      </div>
    </Layout>
  );
}
