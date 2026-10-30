"use client";

import { useRouter } from "next/navigation";
import { signIn } from "@/lib/admin/client";
import { AdminSignIn } from "./admin-sign-in";

/** Mount only after the authentication endpoints and admin guard are configured. */
export function AdminLoginScreen() {
  const router = useRouter();
  async function handleSignIn(email: string, password: string) {
    await signIn(email, password);
    router.replace("/admin");
    router.refresh();
  }
  return <AdminSignIn onSignIn={handleSignIn} />;
}
