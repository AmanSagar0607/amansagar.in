import { AdminSessionShell } from "@/components/admin/admin-session-shell";
import { adminPageContext } from "@/lib/admin/admin-page-context";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { identity } = await adminPageContext();
  return <AdminSessionShell email={identity.email || "Administrator"}>{children}</AdminSessionShell>;
}
