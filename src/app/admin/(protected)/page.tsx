import { AdminInitialize } from "@/components/admin/admin-initialize";
import { AuthorizedDashboard } from "@/components/admin/authorized-workspace";
import { adminPageContext } from "@/lib/admin/admin-page-context";
import { ContentNotInitializedError } from "@/lib/admin/versioned-repository";

export default async function AdminPage() {
  const { service } = await adminPageContext();
  try {
    return await AuthorizedDashboard({ service });
  } catch (error) {
    if (error instanceof ContentNotInitializedError) return <AdminInitialize />;
    throw error;
  }
}
