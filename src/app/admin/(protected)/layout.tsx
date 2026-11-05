import { Suspense } from "react";
import { AdminSessionShell } from "@/components/admin/admin-session-shell";
import { AdminSessionLoading } from "@/components/admin/admin-session-loading";
import { adminPageContext } from "@/lib/admin/admin-page-context";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminSessionLoading />}>
      <AuthenticatedAdminLayout>{children}</AuthenticatedAdminLayout>
    </Suspense>
  );
}

async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { identity } = await adminPageContext();
  return (
    <AdminSessionShell email={identity.email || "Administrator"}>
      {children}
    </AdminSessionShell>
  );
}
