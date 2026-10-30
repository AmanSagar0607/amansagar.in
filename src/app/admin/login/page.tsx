import type { Metadata } from "next";
import { AdminLoginScreen } from "@/components/admin/admin-login-screen";
export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};
export default function LoginPage() {
  return <AdminLoginScreen />;
}
