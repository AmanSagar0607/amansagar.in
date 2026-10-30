"use client";
import { usePathname } from "next/navigation";

/** Keep portfolio navigation and footer outside the private admin workspace. */
export function SiteChrome({
  children,
  header,
  dock,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  dock: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  return (
    <>
      {admin ? null : header}
      {admin ? null : dock}
      {children}
      {admin ? null : footer}
    </>
  );
}
