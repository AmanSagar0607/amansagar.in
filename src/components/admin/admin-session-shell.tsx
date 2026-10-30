"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/admin/client";
import { AdminShell } from "./admin-shell";

/** Use only inside a server-authorized admin layout with mounted authentication routes. */
export function AdminSessionShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const router = useRouter();
  const [error, setError] = useState(false);
  async function handleSignOut() {
    setError(false);
    try {
      await signOut();
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError(true);
    }
  }
  return (
    <AdminShell email={email} signOut={handleSignOut}>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-500/50 px-3 py-2 text-sm text-red-500"
        >
          Could not sign out. Please try again.
        </p>
      )}
      {children}
    </AdminShell>
  );
}
