import { adminPageContext } from "@/lib/admin/admin-page-context";

export default async function ProfilePage() {
  const { identity } = await adminPageContext();
  return (
    <section className="max-w-xl space-y-2">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-muted-foreground text-sm">
        Signed in as {identity.email || "Administrator"}.
      </p>
    </section>
  );
}
