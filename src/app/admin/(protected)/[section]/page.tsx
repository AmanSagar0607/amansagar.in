import { notFound } from "next/navigation";
import { isContentSection } from "@/lib/admin/content-sections";
import { AuthorizedContentList, AuthorizedSettings } from "@/components/admin/authorized-workspace";
import { adminPageContext } from "@/lib/admin/admin-page-context";
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isContentSection(section) && section !== "settings") notFound();
  const { service } = await adminPageContext();
  if (section === "settings") return <AuthorizedSettings service={service} />;
  if (!isContentSection(section)) notFound();
  return <AuthorizedContentList service={service} section={section} />;
}
